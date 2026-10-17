import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import CryptoJS from "crypto-js";

import { ScreenContainer } from "@/components/screen-container";
import { getDeviceDatabase, initializeDeviceStorage } from "@/src/core/storage/device-store";

const BACKUP_FORMAT = "FINORA_BACKUP_V1";
const TABLES = ["local_accounts", "wallets", "categories", "transactions", "budgets"] as const;
type BackupPayload = { format: string; schemaVersion: number; createdAt: string; tables: Record<string, Record<string, unknown>[]> };

function ActionButton({ title, detail, icon, onPress, disabled }: { title: string; detail: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; disabled?: boolean }) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, backgroundColor: disabled ? "#E2E8F0" : "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginTop: 12 }}>
    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#E6FFFA", alignItems: "center", justifyContent: "center", marginRight: 12 }}><Feather name={icon} size={21} color="#0F9F91" /></View>
    <View style={{ flex: 1 }}><Text style={{ color: "#172033", fontWeight: "800", fontSize: 15 }}>{title}</Text><Text style={{ color: "#64748B", fontSize: 12, lineHeight: 18, marginTop: 4 }}>{detail}</Text></View>
    <Feather name="chevron-right" size={20} color="#94A3B8" />
  </TouchableOpacity>;
}

export default function BackupRestoreScreen() {
  const [backupPassword, setBackupPassword] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [busy, setBusy] = useState(false);

  const createPayload = async (): Promise<BackupPayload> => {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const tables: Record<string, Record<string, unknown>[]> = {};
    for (const table of TABLES) tables[table] = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM ${table}`);
    return { format: BACKUP_FORMAT, schemaVersion: 11, createdAt: new Date().toISOString(), tables };
  };

  const encryptPayload = async () => {
    if (backupPassword.trim().length < 8) throw new Error("Mật khẩu sao lưu phải có ít nhất 8 ký tự.");
    const payload = await createPayload();
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), backupPassword).toString();
    return JSON.stringify({ format: BACKUP_FORMAT, encrypted: true, payload: encrypted }, null, 2);
  };

  const backupToFolder = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permission.granted) return;
      const fileName = `Finora-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.finora`;
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, fileName, "application/json");
      await FileSystem.writeAsStringAsync(uri, await encryptPayload(), { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert("Sao lưu thành công", "Tệp sao lưu đã được lưu vào thư mục bạn chọn. Hãy giữ mật khẩu sao lưu ở nơi an toàn.");
    } catch (e) {
      Alert.alert("Không thể sao lưu", e instanceof Error ? e.message : "Đã xảy ra lỗi.");
    } finally { setBusy(false); }
  };

  const restoreFromFile = async () => {
    if (busy) return;
    if (restorePassword.length < 8) { Alert.alert("Thiếu mật khẩu", "Nhập mật khẩu đã dùng khi tạo tệp sao lưu."); return; }
    setBusy(true);
    try {
      const picked = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/plain", "*/*"], copyToCacheDirectory: true, multiple: false });
      if (picked.canceled || !picked.assets[0]) return;
      const raw = await FileSystem.readAsStringAsync(picked.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      const envelope = JSON.parse(raw) as { format?: string; encrypted?: boolean; payload?: string };
      if (envelope.format !== BACKUP_FORMAT || envelope.encrypted !== true || typeof envelope.payload !== "string") throw new Error("Tệp không phải bản sao lưu Finora hợp lệ.");
      const decrypted = CryptoJS.AES.decrypt(envelope.payload, restorePassword).toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error("Mật khẩu sai hoặc tệp sao lưu bị hỏng.");
      const payload = JSON.parse(decrypted) as BackupPayload;
      if (payload.format !== BACKUP_FORMAT || !payload.tables || !TABLES.every((t) => Array.isArray(payload.tables[t]))) throw new Error("Dữ liệu trong tệp không hợp lệ.");
      Alert.alert("Xác nhận khôi phục", "Khôi phục sẽ thay thế toàn bộ ví, giao dịch, danh mục, ngân sách và thông tin tài khoản cục bộ hiện có trên thiết bị. Hãy chắc chắn bạn đã sao lưu dữ liệu hiện tại.", [
        { text: "Hủy", style: "cancel", onPress: () => setBusy(false) },
        { text: "Khôi phục và thay thế", style: "destructive", onPress: () => { void (async () => {
          try {
            await initializeDeviceStorage();
            const db = await getDeviceDatabase();
            await db.withTransactionAsync(async () => {
              await db.execAsync("PRAGMA defer_foreign_keys = ON;");
              await db.runAsync("DELETE FROM transactions");
              await db.runAsync("DELETE FROM budgets");
              await db.runAsync("DELETE FROM categories");
              await db.runAsync("DELETE FROM wallets");
              await db.runAsync("DELETE FROM local_accounts");
              const columns: Record<string, string[]> = {
                local_accounts: ["id","open_id","name","email","login_method","last_signed_in"],
                wallets: ["id","user_id","name","type","currency","opening_balance","allow_negative","is_archived","created_at","updated_at"],
                categories: ["id","user_id","name","type","parent_id","icon","is_archived","created_at","updated_at"],
                transactions: ["id","user_id","type","amount","currency","wallet_id","source_wallet_id","destination_wallet_id","category_id","note","occurred_at","created_at","updated_at"],
                budgets: ["id","user_id","category_id","wallet_id","amount","currency","period_start","period_end","created_at","updated_at"],
              };
              for (const table of ["local_accounts", "wallets", "categories", "transactions", "budgets"] as const) {
                for (const row of payload.tables[table]) {
                  const keys = columns[table].filter((key) => Object.prototype.hasOwnProperty.call(row, key));
                  if (keys.length !== columns[table].length) throw new Error("Tệp sao lưu thiếu trường dữ liệu cần thiết.");
                  const placeholders = keys.map(() => "?").join(", ");
                  await db.runAsync(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`, ...keys.map((key) => row[key] as string | number | null));
                }
              }
            });
            Alert.alert("Khôi phục hoàn tất", "Dữ liệu tài chính đã được khôi phục. Thông tin đăng nhập/mật khẩu không nằm trong tệp sao lưu; nếu đã cài lại ứng dụng, bạn cần đăng nhập hoặc đăng ký lại tài khoản.");
          } catch (e) { Alert.alert("Khôi phục thất bại", e instanceof Error ? e.message : "Đã xảy ra lỗi. Dữ liệu được xử lý trong giao dịch cơ sở dữ liệu."); }
          finally { setBusy(false); }
        })(); } },
      ]);
    } catch (e) {
      Alert.alert("Không thể đọc bản sao lưu", e instanceof Error ? e.message : "Tệp không hợp lệ hoặc mật khẩu không đúng.");
      setBusy(false);
    }
  };

  return <ScreenContainer className="bg-[#F8FAFC]"><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
    <TouchableOpacity onPress={() => { /* Expo Router back is provided by header navigation */ }} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}><Feather name="shield" size={24} color="#0F9F91" /><Text style={{ color: "#122D2A", fontSize: 28, fontWeight: "800", marginLeft: 10 }}>Sao lưu dữ liệu</Text></TouchableOpacity>
    <Text style={{ color: "#64748B", fontSize: 14, lineHeight: 21 }}>Tạo tệp sao lưu được mã hóa bằng mật khẩu riêng, hoặc khôi phục từ tệp đã lưu. Bạn có thể chọn bộ nhớ thiết bị hoặc nhà cung cấp lưu trữ hiển thị trong trình chọn thư mục (nếu có Google Drive).</Text>
    <View style={{ marginTop: 22, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
      <Text style={{ color: "#172033", fontSize: 16, fontWeight: "800" }}>Mật khẩu sao lưu</Text>
      <Text style={{ color: "#64748B", fontSize: 12, lineHeight: 18, marginTop: 5 }}>Tối thiểu 8 ký tự. Mật khẩu này không phải mật khẩu đăng nhập. Nếu quên, không thể giải mã tệp.</Text>
      <TextInput value={backupPassword} onChangeText={setBackupPassword} placeholder="Tạo mật khẩu sao lưu" secureTextEntry autoCapitalize="none" autoCorrect={false} style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, padding: 12, marginTop: 12, color: "#172033" }} />
      <ActionButton title="Sao lưu vào thư mục" detail="Chọn Documents/backupdata hoặc vị trí lưu trữ khác" icon="folder" onPress={() => void backupToFolder()} disabled={busy} />
      <ActionButton title="Sao lưu vào Google Drive hoặc bộ nhớ khác" detail="Chọn Google Drive trong trình chọn thư mục nếu thiết bị có cung cấp" icon="cloud" onPress={() => void backupToFolder()} disabled={busy} />
    </View>
    <View style={{ marginTop: 18, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
      <Text style={{ color: "#172033", fontSize: 16, fontWeight: "800" }}>Khôi phục dữ liệu</Text>
      <Text style={{ color: "#64748B", fontSize: 12, lineHeight: 18, marginTop: 5 }}>Chọn tệp .finora và nhập đúng mật khẩu sao lưu.</Text>
      <TextInput value={restorePassword} onChangeText={setRestorePassword} placeholder="Mật khẩu của tệp sao lưu" secureTextEntry autoCapitalize="none" autoCorrect={false} style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, padding: 12, marginTop: 12, color: "#172033" }} />
      <ActionButton title="Chọn tệp để khôi phục" detail="Kiểm tra tệp trước khi hỏi xác nhận thay thế dữ liệu" icon="upload-cloud" onPress={() => void restoreFromFile()} disabled={busy} />
    </View>
    <View style={{ backgroundColor: "#FFF7ED", borderRadius: 16, padding: 14, marginTop: 18 }}><Text style={{ color: "#9A3412", fontWeight: "800" }}>Lưu ý quan trọng</Text><Text style={{ color: "#9A3412", fontSize: 12, lineHeight: 18, marginTop: 5 }}>Tệp sao lưu chứa dữ liệu tài chính đã mã hóa, nhưng không chứa mật khẩu đăng nhập hoặc thông tin xác thực trong SecureStore. Khôi phục sẽ thay thế dữ liệu hiện có sau khi bạn xác nhận. Hãy thử khôi phục trên thiết bị phụ trước khi phụ thuộc vào bản sao lưu.</Text></View>
  </ScrollView></ScreenContainer>;
}
