from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path('assets/icons')
OUT = Path('components/ui/finora-icons.tsx')

ATTR_MAP = {
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'fill-opacity': 'fillOpacity',
    'stroke-opacity': 'strokeOpacity',
}

def local(tag: str) -> str:
    return tag.rsplit('}', 1)[-1]

def component_name(path: Path) -> str:
    relative = path.relative_to(ROOT).with_suffix('')
    words = re.findall(r'[A-Za-z0-9]+', '_'.join(relative.parts))
    return 'Finora' + ''.join(w[:1].upper() + w[1:] for w in words) + 'Icon'

def jsx_value(value: str, attr: str) -> str:
    if value == 'currentColor':
        return '{color}'
    if attr in {'opacity', 'fillOpacity', 'strokeOpacity', 'strokeWidth'}:
        try:
            float(value)
            return '{' + value + '}'
        except ValueError:
            pass
    return '"' + value.replace('"', '&quot;') + '"'

def attrs(element: ET.Element, inherited: dict[str, str]) -> dict[str, str]:
    merged = dict(inherited)
    for key, value in element.attrib.items():
        key = local(key)
        if key in {'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
                   'fill-rule', 'clip-rule', 'fill-opacity', 'stroke-opacity', 'opacity'}:
            merged[key] = value
    return merged

def render(element: ET.Element, inherited: dict[str, str], depth: int) -> list[str]:
    tag = local(element.tag)
    current = attrs(element, inherited)
    indent = '  ' * depth
    if tag == 'g':
        props = []
        for key in ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
                    'fill-rule', 'clip-rule', 'fill-opacity', 'stroke-opacity', 'opacity']:
            if key in element.attrib:
                mapped = ATTR_MAP.get(key, key)
                props.append(f'{mapped}={jsx_value(element.attrib[key], mapped)}')
        head = f'{indent}<G' + ((' ' + ' '.join(props)) if props else '') + '>'
        lines = [head]
        for child in list(element):
            lines.extend(render(child, current, depth + 1))
        lines.append(f'{indent}</G>')
        return lines
    if tag not in {'path', 'circle', 'rect'}:
        lines: list[str] = []
        for child in list(element):
            lines.extend(render(child, current, depth))
        return lines
    prop_order = {
        'path': ['d'],
        'circle': ['cx', 'cy', 'r'],
        'rect': ['x', 'y', 'width', 'height', 'rx', 'ry'],
    }[tag]
    props: list[str] = []
    for key in prop_order:
        if key in element.attrib:
            props.append(f'{key}={jsx_value(element.attrib[key], key)}')
    for key in ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
                'fill-rule', 'clip-rule', 'fill-opacity', 'stroke-opacity', 'opacity']:
        if key in current:
            mapped = ATTR_MAP.get(key, key)
            # Put inherited fill/stroke only when they are not the default SVG values.
            if key == 'fill':
                props.append('fill="none"' if current[key] == 'none' else f'fill={jsx_value(current[key], mapped)}')
            elif key == 'stroke' and current[key] != 'none':
                props.append(f'stroke={jsx_value(current[key], mapped)}')
            elif key not in {'fill', 'stroke'}:
                props.append(f'{mapped}={jsx_value(current[key], mapped)}')
    return [f'{indent}<{tag.capitalize()} ' + ' '.join(props) + ' />']

files = sorted(ROOT.rglob('*.svg'))
components: list[tuple[str, str]] = []
blocks: list[str] = []
for path in files:
    tree = ET.parse(path)
    root = tree.getroot()
    name = component_name(path)
    lines = [
        f'export function {name}({{ size = 24, color, style, accessibilityLabel }}: FinoraIconProps) {{',
        '  return (',
        '    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>',
    ]
    inherited = {}
    for child in list(root):
        lines.extend(render(child, inherited, 3))
    lines.extend(['    </Svg>', '  );', '}'])
    blocks.append('\n'.join(lines))
    icon_key = path.relative_to(ROOT).with_suffix('').as_posix().replace('/', '_')
    components.append((icon_key, name))

registry = ',\n'.join(f'  "{key}": {name}' for key, name in components)
content = '''import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

export type FinoraIconProps = {
  size?: number;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

'''
content += '\n\n'.join(blocks)
content += f'''\n\nconst ICON_COMPONENTS = {{\n{registry}\n}} as const;\n\nexport type FinoraIconName = keyof typeof ICON_COMPONENTS;\n\nexport function FinoraIcon({{ name, ...props }}: {{ name: FinoraIconName }} & FinoraIconProps) {{\n  const Icon = ICON_COMPONENTS[name];\n  return <Icon {{...props}} />;\n}}\n'''
OUT.write_text(content, encoding='utf-8')
print(f'Generated {len(files)} icons at {OUT}')
