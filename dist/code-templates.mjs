// Small, authored source blocks. Each tier has five structures and ten name sets.
export const CODE_TEMPLATES={
  "javascript": [
    {
      "title": "Сумма значений",
      "short": "function {{sum}}({{items}}) {\n  const {{result}} = {{items}}.reduce(({{output}}, {{value}}) => {{output}} + {{value}}, 0);\n  return {{result}};\n}",
      "medium": "function {{sum}}({{items}}) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    {{result}} += {{value}};\n  }\n  return {{result}};\n}",
      "long": "function {{sum}}({{items}}) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    if (Number.isFinite({{value}})) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}\n\nconst {{data}} = [4, 8, 12];\nconsole.log({{sum}}({{data}}));"
    },
    {
      "title": "Фильтрация по порогу",
      "short": "const {{select}} = ({{items}}, {{limit}}) => {\n  const {{result}} = {{items}}.filter({{value}} => {{value}} >= {{limit}});\n  return {{result}};\n};",
      "medium": "function {{select}}({{items}}, {{limit}}) {\n  const {{result}} = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {{result}}.push({{value}});\n  }\n  return {{result}};\n}",
      "long": "function {{select}}({{items}}, {{limit}}) {\n  const {{result}} = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push({{value}});\n    }\n  }\n  return {{result}}.sort((a, b) => a - b);\n}\n\nconsole.log({{select}}([4, 8, 12], 6));"
    },
    {
      "title": "Частота значений",
      "short": "function {{frequency}}({{words}}) {\n  const {{result}} = {};\n  {{words}}.forEach({{word}} => {{result}}[{{word}}] = ({{result}}[{{word}}] ?? 0) + 1);\n  return {{result}};\n}",
      "medium": "function {{frequency}}({{words}}) {\n  const {{result}} = {};\n  for (const {{word}} of {{words}}) {\n    {{result}}[{{word}}] = ({{result}}[{{word}}] ?? 0) + 1;\n  }\n  return {{result}};\n}",
      "long": "function {{frequency}}({{words}}) {\n  const {{result}} = new Map();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim();\n    if (!{{key}}) continue;\n    {{result}}.set({{key}}, ({{result}}.get({{key}}) ?? 0) + 1);\n  }\n  return {{result}};\n}\n\nconsole.log({{frequency}}([\"build\", \"test\", \"build\"]));"
    },
    {
      "title": "Поиск элемента",
      "short": "function {{find}}({{items}}, {{limit}}) {\n  const {{found}} = {{items}}.find({{value}} => {{value}} > {{limit}});\n  return {{found}} ?? null;\n}",
      "medium": "function {{find}}({{items}}, {{limit}}) {\n  for (const {{value}} of {{items}}) {\n    if ({{value}} > {{limit}}) return {{value}};\n  }\n  return null;\n}",
      "long": "function {{find}}({{items}}, {{limit}}) {\n  for (let {{index}} = 0; {{index}} < {{items}}.length; {{index}}++) {\n    const {{value}} = {{items}}[{{index}}];\n    if ({{value}} > {{limit}}) {\n      return { index: {{index}}, value: {{value}} };\n    }\n  }\n  return null;\n}"
    },
    {
      "title": "Очистка строк",
      "short": "function {{normalize}}({{words}}) {\n  const {{result}} = {{words}}.map({{word}} => {{word}}.trim().toLowerCase());\n  return {{result}}.filter({{word}} => {{word}}.length > 0);\n}",
      "medium": "function {{normalize}}({{words}}) {\n  const {{result}} = new Set();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    {{result}}.add({{key}});\n  }\n  return [...{{result}}].filter(Boolean).sort();\n}",
      "long": "function {{normalize}}({{words}}) {\n  const {{result}} = new Set();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if ({{key}}.length > 0) {\n      {{result}}.add({{key}});\n    }\n  }\n  return [...{{result}}].sort();\n}\n\nconsole.log({{normalize}}([\"Ada\", \" ada \"]));"
    }
  ],
  "typescript": [
    {
      "title": "Сумма значений",
      "short": "function {{sum}}({{items}}: number[]) {\n  const {{result}} = {{items}}.reduce(({{output}}, {{value}}) => {{output}} + {{value}}, 0);\n  return {{result}};\n}",
      "medium": "function {{sum}}({{items}}: number[]) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    {{result}} += {{value}};\n  }\n  return {{result}};\n}",
      "long": "function {{sum}}({{items}}: number[]) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    if (Number.isFinite({{value}})) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}\n\nconst {{data}} = [4, 8, 12];\nconsole.log({{sum}}({{data}}));"
    },
    {
      "title": "Фильтрация по порогу",
      "short": "const {{select}} = ({{items}}: number[], {{limit}}: number) => {\n  const {{result}} = {{items}}.filter({{value}} => {{value}} >= {{limit}});\n  return {{result}};\n};",
      "medium": "function {{select}}({{items}}: number[], {{limit}}: number) {\n  const {{result}} = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {{result}}.push({{value}});\n  }\n  return {{result}};\n}",
      "long": "function {{select}}({{items}}: number[], {{limit}}: number) {\n  const {{result}} = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push({{value}});\n    }\n  }\n  return {{result}}.sort((a, b) => a - b);\n}\n\nconsole.log({{select}}([4, 8, 12], 6));"
    },
    {
      "title": "Частота значений",
      "short": "function {{frequency}}({{words}}: string[]) {\n  const {{count}} = new Set({{words}}).size;\n  return {{count}};\n}\nconst {{output}} = {{frequency}}([\"build\", \"test\"]);",
      "medium": "function {{frequency}}({{words}}: string[]) {\n  const {{result}} = {} as Record<string,number>;\n  for (const {{word}} of {{words}}) {\n    {{result}}[{{word}}] = ({{result}}[{{word}}] ?? 0) + 1;\n  }\n  return {{result}};\n}",
      "long": "function {{frequency}}({{words}}: string[]) {\n  const {{result}} = new Map<string,number>();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim();\n    if (!{{key}}) continue;\n    {{result}}.set({{key}}, ({{result}}.get({{key}}) ?? 0) + 1);\n  }\n  return {{result}};\n}\n\nconsole.log({{frequency}}([\"build\", \"test\", \"build\"]));"
    },
    {
      "title": "Поиск элемента",
      "short": "function {{find}}({{items}}: number[], {{limit}}: number) {\n  const {{found}} = {{items}}.find({{value}} => {{value}} > {{limit}});\n  return {{found}} ?? null;\n}",
      "medium": "function {{find}}({{items}}: number[], {{limit}}: number) {\n  for (const {{value}} of {{items}}) {\n    if ({{value}} > {{limit}}) return {{value}};\n  }\n  return null;\n}",
      "long": "function {{find}}({{items}}: number[], {{limit}}: number) {\n  for (let {{index}} = 0; {{index}} < {{items}}.length; {{index}}++) {\n    const {{value}} = {{items}}[{{index}}];\n    if ({{value}} > {{limit}}) {\n      return { index: {{index}}, value: {{value}} };\n    }\n  }\n  return null;\n}"
    },
    {
      "title": "Очистка строк",
      "short": "function {{normalize}}({{words}}: string[]) {\n  const {{result}} = {{words}}.map({{word}} => {{word}}.trim().toLowerCase());\n  return {{result}}.filter({{word}} => {{word}}.length > 0);\n}",
      "medium": "function {{normalize}}({{words}}: string[]) {\n  const {{result}} = new Set();\n  for (const {{word}} of {{words}}) {\n    {{result}}.add({{word}}.trim().toLowerCase());\n  }\n  return [...{{result}}].filter(Boolean).sort();\n}",
      "long": "function {{normalize}}({{words}}: string[]) {\n  const {{result}} = new Set();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if ({{key}}.length > 0) {\n      {{result}}.add({{key}});\n    }\n  }\n  return [...{{result}}].sort();\n}\n\nconsole.log({{normalize}}([\"Ada\", \" ada \"]));"
    }
  ],
  "python": [
    {
      "title": "Сумма значений",
      "short": "def {{sum}}({{items}}):\n    {{result}} = 0\n    for {{value}} in {{items}}:\n        {{result}} += {{value}}\n    return {{result}}\n\nprint({{sum}}([4, 8]))",
      "medium": "def {{sum}}({{items}}):\n    {{result}} = 0\n    for {{value}} in {{items}}:\n        if {{value}} is not None:\n            {{result}} += {{value}}\n    return {{result}}\n\nprint({{sum}}([4, 8, 12]))",
      "long": "def {{average}}({{items}}):\n    {{result}} = 0\n    {{count}} = 0\n    for {{value}} in {{items}}:\n        if isinstance({{value}}, (int, float)):\n            {{result}} += {{value}}\n            {{count}} += 1\n    return {{result}} / {{count}} if {{count}} else 0\n\nprint({{average}}([4, 8, 12]))"
    },
    {
      "title": "Фильтрация по порогу",
      "short": "def {{select}}({{items}}, {{limit}}):\n    return [{{value}} for {{value}} in {{items}} if {{value}} >= {{limit}}]\n\nprint({{select}}([4, 8, 12], 6))",
      "medium": "def {{select}}({{items}}, {{limit}}):\n    {{result}} = []\n    for {{value}} in {{items}}:\n        if {{value}} >= {{limit}}:\n            {{result}}.append({{value}})\n    return sorted({{result}})\n\nprint({{select}}([4, 8, 12], 6))",
      "long": "def {{within}}({{items}}, {{low}}, {{high}}):\n    {{result}} = []\n    for {{value}} in {{items}}:\n        if {{low}} <= {{value}} <= {{high}}:\n            {{result}}.append({{value}})\n    return sorted(set({{result}}))\n\n{{data}} = [4, 8, 12, 16, 20]\n{{output}} = {{within}}({{data}}, 6, 18)\nprint({{output}})"
    },
    {
      "title": "Частота значений",
      "short": "def {{frequency}}({{words}}):\n    {{result}} = {}\n    for {{word}} in {{words}}:\n        {{result}}[{{word}}] = {{result}}.get({{word}}, 0) + 1\n    return {{result}}",
      "medium": "def {{frequency}}({{words}}):\n    {{result}} = {}\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip()\n        {{result}}[{{key}}] = {{result}}.get({{key}}, 0) + 1\n    return {{result}}\n\nprint({{frequency}}([\"build\", \"test\"]))",
      "long": "def {{frequency}}({{words}}):\n    {{result}} = {}\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip().lower()\n        if not {{key}}:\n            continue\n        {{result}}[{{key}}] = {{result}}.get({{key}}, 0) + 1\n    return {{result}}\n\n{{data}} = [\"build\", \"test\", \"BUILD\"]\n{{output}} = {{frequency}}({{data}})\nprint({{output}})"
    },
    {
      "title": "Поиск элемента",
      "short": "def {{find}}({{items}}, {{limit}}):\n    for {{value}} in {{items}}:\n        if {{value}} > {{limit}}:\n            return {{value}}\n    return None\n\nprint({{find}}([4, 8], 6))",
      "medium": "def {{find}}({{items}}, {{limit}}):\n    for {{index}}, {{value}} in enumerate({{items}}):\n        if {{value}} > {{limit}}:\n            return {{index}}, {{value}}\n    return None\n\nprint({{find}}([4, 8, 12], 6))",
      "long": "def {{find}}({{items}}, {{limit}}):\n    for {{index}}, {{value}} in enumerate({{items}}):\n        if {{value}} > {{limit}}:\n            return {\"index\": {{index}}, \"value\": {{value}}}\n    return None\n\n{{data}} = [4, 8, 12, 16]\n{{found}} = {{find}}({{data}}, 10)\nif {{found}} is not None:\n    print({{found}}[\"value\"])"
    },
    {
      "title": "Очистка строк",
      "short": "def {{normalize}}({{words}}):\n    return [{{word}}.strip().lower() for {{word}} in {{words}} if {{word}}.strip()]\n\n{{data}} = [\"Ada\", \" Bob \", \"\"]\nprint({{normalize}}({{data}}))",
      "medium": "def {{normalize}}({{words}}):\n    {{result}} = set()\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip().lower()\n        if {{key}}:\n            {{result}}.add({{key}})\n    return sorted({{result}}, reverse=False)\n\nprint({{normalize}}([\"Ada\", \"ada\"]))",
      "long": "def {{normalize}}({{words}}):\n    {{result}} = set()\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip().lower()\n        if {{key}}:\n            {{result}}.add({{key}})\n    return sorted({{result}})\n\n{{data}} = [\"Ada\", \" Bob \", \"ADA\", \"\"]\n{{output}} = {{normalize}}({{data}})\nfor {{word}} in {{output}}:\n    print({{word}})"
    }
  ],
  "c": [
    {
      "title": "Сумма значений",
      "short": "int {{sum}}(int {{low}}, int {{high}}) {\n  int {{result}} = {{low}} + {{high}};\n  return {{result}};\n}",
      "medium": "#include <stddef.h>\nint {{sum}}(const int *{{items}}, size_t {{count}}) {\n  int {{result}} = 0;\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    {{result}} += {{items}}[{{index}}];\n  }\n  return {{result}};\n}",
      "long": "#include <stddef.h>\nint {{sum}}(const int *{{items}}, size_t {{count}}) {\n  if ({{items}} == NULL) {\n    return 0;\n  }\n  int {{result}} = 0;\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    {{result}} += {{items}}[{{index}}];\n  }\n  return {{result}};\n}"
    },
    {
      "title": "Проверка границ",
      "short": "int {{select}}(int {{value}}, int {{limit}}) {\n  if ({{value}} >= {{limit}}) {\n    return {{value}};\n  }\n  return 0;\n}",
      "medium": "int {{within}}(int {{value}}, int {{low}}, int {{high}}) {\n  if ({{value}} < {{low}}) {\n    return {{low}};\n  }\n  return {{value}} > {{high}} ? {{high}} : {{value}};\n}",
      "long": "int {{within}}(int {{value}}, int {{low}}, int {{high}}) {\n  if ({{low}} > {{high}}) {\n    return {{value}};\n  }\n  if ({{value}} < {{low}}) {\n    return {{low}};\n  }\n  if ({{value}} > {{high}}) {\n    return {{high}};\n  }\n  return {{value}};\n}"
    },
    {
      "title": "Длина строки",
      "short": "int {{frequency}}(const char *{{text}}) {\n  int {{count}} = 0;\n  while ({{text}}[{{count}}] != '\\0') {\n    ++{{count}};\n  }\n  return {{count}};\n}",
      "medium": "int {{frequency}}(const char *{{text}}) {\n  if (!{{text}}) return 0;\n  int {{count}} = 0;\n  while ({{text}}[{{count}}] != '\\0') {\n    ++{{count}};\n  }\n  return {{count}};\n}",
      "long": "int {{frequency}}(const char *{{text}}, char {{key}}) {\n  if (!{{text}}) {\n    return 0;\n  }\n  int {{count}} = 0;\n  while (*{{text}} != '\\0') {\n    if (*{{text}} == {{key}}) {\n      ++{{count}};\n    }\n    ++{{text}};\n  }\n  return {{count}};\n}"
    },
    {
      "title": "Поиск элемента",
      "short": "int {{find}}(int {{value}}, int {{limit}}) {\n  int {{found}} = {{value}} == {{limit}};\n  return {{found}} ? {{value}} : -1;\n}",
      "medium": "int {{find}}(const int *{{items}}, int {{count}}, int {{limit}}) {\n  for (int {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    if ({{items}}[{{index}}] == {{limit}}) return {{index}};\n  }\n  return -1;\n}",
      "long": "int {{find}}(const int *{{items}}, int {{count}}, int {{limit}}) {\n  if (!{{items}} || {{count}} <= 0) return -1;\n  for (int {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    if ({{items}}[{{index}}] == {{limit}}) {\n      return {{index}};\n    }\n  }\n  return -1;\n}"
    },
    {
      "title": "Обмен значений",
      "short": "void {{normalize}}(int *{{low}}, int *{{high}}) {\n  int {{value}} = *{{low}};\n  *{{low}} = *{{high}};\n  *{{high}} = {{value}};\n}",
      "medium": "void {{normalize}}(int *{{low}}, int *{{high}}) {\n  if (!{{low}} || !{{high}}) return;\n  int {{value}} = *{{low}};\n  *{{low}} = *{{high}};\n  *{{high}} = {{value}};\n}",
      "long": "void {{normalize}}(int *{{low}}, int *{{high}}) {\n  if (!{{low}} || !{{high}}) {\n    return;\n  }\n  if (*{{low}} > *{{high}}) {\n    int {{value}} = *{{low}};\n    *{{low}} = *{{high}};\n    *{{high}} = {{value}};\n  }\n}"
    }
  ],
  "cpp": [
    {
      "title": "Сумма значений",
      "short": "#include <numeric>\n#include <vector>\nint {{sum}}(const std::vector<int>& {{items}}) {\n  const int {{result}} = std::accumulate({{items}}.begin(), {{items}}.end(), 0);\n  return {{result}};\n}",
      "medium": "#include <vector>\nint {{sum}}(const std::vector<int>& {{items}}) {\n  int {{result}} = 0;\n  for (const auto {{value}} : {{items}}) {\n    {{result}} += {{value}};\n  }\n  return {{result}};\n}",
      "long": "#include <vector>\ndouble {{average}}(const std::vector<int>& {{items}}) {\n  if ({{items}}.empty()) {\n    return 0;\n  }\n  double {{result}} = 0;\n  for (const auto {{value}} : {{items}}) {\n    {{result}} += {{value}};\n  }\n  return {{result}} / {{items}}.size();\n}"
    },
    {
      "title": "Ограничение диапазона",
      "short": "#include <algorithm>\nint {{select}}(int {{value}}, int {{limit}}) {\n  int {{result}} = std::max({{value}}, {{limit}});\n  return {{result}};\n}",
      "medium": "#include <algorithm>\nint {{within}}(int {{value}}, int {{low}}, int {{high}}) {\n  if ({{low}} > {{high}}) return {{value}};\n  return std::clamp({{value}}, {{low}}, {{high}});\n}",
      "long": "#include <algorithm>\nint {{within}}(int {{value}}, int {{low}}, int {{high}}) {\n  if ({{low}} > {{high}}) {\n    std::swap({{low}}, {{high}});\n  }\n  if ({{low}} == {{high}}) return {{low}};\n  const int {{result}} = std::clamp({{value}}, {{low}}, {{high}});\n  return {{result}};\n}"
    },
    {
      "title": "Частота символа",
      "short": "#include <algorithm>\n#include <string>\nint {{frequency}}(const std::string& {{text}}, char {{key}}) {\n  int {{result}} = std::count({{text}}.begin(), {{text}}.end(), {{key}});\n  return {{result}};\n}",
      "medium": "#include <string>\nint {{frequency}}(const std::string& {{text}}, char {{key}}) {\n  int {{count}} = 0;\n  for (char {{value}} : {{text}}) {\n    {{count}} += {{value}} == {{key}};\n  }\n  return {{count}};\n}",
      "long": "#include <string>\nint {{frequency}}(const std::string& {{text}}, char {{key}}) {\n  int {{count}} = 0;\n  for (char {{value}} : {{text}}) {\n    if ({{value}} == {{key}}) {\n      ++{{count}};\n    }\n  }\n  return {{count}};\n}"
    },
    {
      "title": "Поиск элемента",
      "short": "#include <algorithm>\n#include <vector>\nbool {{find}}(const std::vector<int>& {{items}}, int {{limit}}) {\n  return std::find({{items}}.begin(), {{items}}.end(), {{limit}}) != {{items}}.end();\n}",
      "medium": "#include <vector>\nbool {{find}}(const std::vector<int>& {{items}}, int {{limit}}) {\n  for (auto {{value}} : {{items}}) {\n    if ({{value}} == {{limit}}) return true;\n  }\n  return false;\n}",
      "long": "#include <vector>\nint {{find}}(const std::vector<int>& {{items}}, int {{limit}}) {\n  for (int {{index}} = 0; {{index}} < static_cast<int>({{items}}.size()); ++{{index}}) {\n    const int {{value}} = {{items}}[{{index}}];\n    if ({{value}} == {{limit}}) {\n      return {{index}};\n    }\n  }\n  return -1;\n}"
    },
    {
      "title": "Сортировка значений",
      "short": "#include <algorithm>\n#include <vector>\nvoid {{normalize}}(std::vector<int>& {{items}}) {\n  auto {{low}} = {{items}}.begin();\n  auto {{high}} = {{items}}.end();\n  std::sort({{low}}, {{high}});\n}",
      "medium": "#include <algorithm>\n#include <vector>\nvoid {{normalize}}(std::vector<int>& {{items}}) {\n  auto {{low}} = {{items}}.begin();\n  auto {{limit}} = {{items}}.end();\n  std::sort({{low}}, {{limit}});\n  auto {{high}} = std::unique({{items}}.begin(), {{items}}.end());\n  {{items}}.erase({{high}}, {{items}}.end());\n}",
      "long": "#include <algorithm>\n#include <vector>\nstd::vector<int> {{normalize}}(std::vector<int> {{items}}) {\n  const auto {{count}} = {{items}}.size();\n  if ({{count}} == 0) {\n    return {{items}};\n  }\n  std::sort({{items}}.begin(), {{items}}.end());\n  auto {{high}} = std::unique({{items}}.begin(), {{items}}.end());\n  {{items}}.erase({{high}}, {{items}}.end());\n  return {{items}};\n}"
    }
  ]
};
