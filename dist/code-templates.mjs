// Authored algorithms, with explicit identifier slots. Never executed by the trainer.
export const CODE_TEMPLATES={
  "javascript": [
    {
      "title": "Сумма и среднее",
      "short": "function {{sum}}({{items}}) {\n  return {{items}}.reduce(({{result}}, {{value}}) => {{result}} + {{value}}, 0);\n}",
      "medium": "function {{sum}}({{items}}) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    if (Number.isFinite({{value}})) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}",
      "long": "function {{sum}}({{items}}) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    if (Number.isFinite({{value}})) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}\n\nfunction {{average}}({{items}}) {\n  const {{count}} = {{items}}.length;\n  return {{count}} ? {{sum}}({{items}}) / {{count}} : 0;\n}\n\nconst {{data}} = [12, 18, 24, 30];\nconst {{output}} = {\n  total: {{sum}}({{data}}),\n  average: {{average}}({{data}})\n};\nconsole.log({{output}});"
    },
    {
      "title": "Фильтрация по порогу",
      "short": "const {{select}} = ({{items}}, {{limit}}) => {\n  return {{items}}.filter({{value}} => {{value}} >= {{limit}});\n};",
      "medium": "function {{select}}({{items}}, {{limit}}) {\n  const {{result}} = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push({{value}});\n    }\n  }\n  return {{result}}.sort((a, b) => a - b);\n}",
      "long": "function {{select}}({{items}}, {{limit}}) {\n  const {{result}} = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push({{value}});\n    }\n  }\n  return {{result}}.sort((a, b) => a - b);\n}\n\nfunction {{within}}({{items}}, {{low}}, {{high}}) {\n  return {{select}}({{items}}, {{low}}).filter({{value}} => {\n    return {{value}} <= {{high}};\n  });\n}\n\nconst {{data}} = [4, 8, 15, 16, 23, 42];\nconst {{output}} = {{within}}({{data}}, 10, 30);\nfor (const {{entry}} of {{output}}) {\n  console.log({{entry}});\n}"
    },
    {
      "title": "Частота слов",
      "short": "function {{frequency}}({{words}}) {\n  const {{result}} = new Map();\n  for (const {{word}} of {{words}}) {\n    {{result}}.set({{word}}, ({{result}}.get({{word}}) ?? 0) + 1);\n  }\n  return {{result}};\n}",
      "medium": "function {{frequency}}({{words}}) {\n  const {{result}} = new Map();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if (!{{key}}) {\n      continue;\n    }\n    const {{count}} = {{result}}.get({{key}}) ?? 0;\n    {{result}}.set({{key}}, {{count}} + 1);\n  }\n  return {{result}};\n}",
      "long": "function {{frequency}}({{words}}) {\n  const {{result}} = new Map();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if (!{{key}}) {\n      continue;\n    }\n    const {{count}} = {{result}}.get({{key}}) ?? 0;\n    {{result}}.set({{key}}, {{count}} + 1);\n  }\n  return {{result}};\n}\n\nfunction {{ranking}}({{words}}) {\n  const {{data}} = [...{{frequency}}({{words}})];\n  return {{data}}.sort((a, b) => b[1] - a[1]);\n}\n\nconst {{text}} = \"build test build review test build\";\nconst {{output}} = {{ranking}}({{text}}.split(\" \"));\nfor (const [{{key}}, {{count}}] of {{output}}) {\n  console.log({{key}}, {{count}});\n}"
    },
    {
      "title": "Поиск элемента",
      "short": "function {{find}}({{items}}, {{limit}}) {\n  return {{items}}.find({{value}} => {{value}} > {{limit}}) ?? null;\n}",
      "medium": "function {{find}}({{items}}, {{limit}}) {\n  for (let {{index}} = 0; {{index}} < {{items}}.length; {{index}}++) {\n    const {{value}} = {{items}}[{{index}}];\n    if ({{value}} > {{limit}}) {\n      return { index: {{index}}, value: {{value}} };\n    }\n  }\n  return null;\n}",
      "long": "function {{find}}({{items}}, {{limit}}) {\n  for (let {{index}} = 0; {{index}} < {{items}}.length; {{index}}++) {\n    const {{value}} = {{items}}[{{index}}];\n    if ({{value}} > {{limit}}) {\n      return { index: {{index}}, value: {{value}} };\n    }\n  }\n  return null;\n}\n\nfunction {{describe}}({{record}}) {\n  if ({{record}} === null) {\n    return \"No matching entry\";\n  }\n  return `Index: ${ {{record}}.index }, value: ${ {{record}}.value }`;\n}\n\nconst {{data}} = [3, 7, 11, 19];\nconst {{found}} = {{find}}({{data}}, 10);\nconst {{output}} = {{describe}}({{found}});\nconsole.log({{output}});"
    },
    {
      "title": "Очистка и сортировка строк",
      "short": "function {{normalize}}({{words}}) {\n  return {{words}}.map({{word}} => {{word}}.trim().toLowerCase());\n}",
      "medium": "function {{normalize}}({{words}}) {\n  const {{result}} = new Set();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if ({{key}}.length > 0) {\n      {{result}}.add({{key}});\n    }\n  }\n  return [...{{result}}].sort();\n}",
      "long": "function {{normalize}}({{words}}) {\n  const {{result}} = new Set();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if ({{key}}.length > 0) {\n      {{result}}.add({{key}});\n    }\n  }\n  return [...{{result}}].sort();\n}\n\nfunction {{group}}({{words}}) {\n  const {{result}} = {};\n  for (const {{word}} of {{normalize}}({{words}})) {\n    const {{key}} = {{word}}[0];\n    {{result}}[{{key}}] ??= [];\n    {{result}}[{{key}}].push({{word}});\n  }\n  return {{result}};\n}\n\nconst {{data}} = [\" Beta \", \"alpha\", \"beta\", \"delta\"];\nconst {{output}} = {{group}}({{data}});\nconsole.log(JSON.stringify({{output}}, null, 2));"
    }
  ],
  "typescript": [
    {
      "title": "Сумма и среднее",
      "short": "function {{sum}}({{items}}: number[]) {\n  return {{items}}.reduce(({{result}}, {{value}}) => {{result}} + {{value}}, 0);\n}",
      "medium": "function {{sum}}({{items}}: number[]) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    if (Number.isFinite({{value}})) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}",
      "long": "function {{sum}}({{items}}: number[]) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    if (Number.isFinite({{value}})) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}\n\nfunction {{average}}({{items}}: number[]) {\n  const {{count}} = {{items}}.length;\n  return {{count}} ? {{sum}}({{items}}) / {{count}} : 0;\n}\n\nconst {{data}} = [12, 18, 24, 30];\nconst {{output}} = {\n  total: {{sum}}({{data}}),\n  average: {{average}}({{data}})\n};\nconsole.log({{output}});"
    },
    {
      "title": "Фильтрация по порогу",
      "short": "const {{select}} = ({{items}}: number[], {{limit}}: number) => {\n  return {{items}}.filter({{value}} => {{value}} >= {{limit}});\n};",
      "medium": "function {{select}}({{items}}: number[], {{limit}}: number) {\n  const {{result}}: number[] = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push({{value}});\n    }\n  }\n  return {{result}}.sort((a, b) => a - b);\n}",
      "long": "function {{select}}({{items}}: number[], {{limit}}: number) {\n  const {{result}}: number[] = [];\n  for (const {{value}} of {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push({{value}});\n    }\n  }\n  return {{result}}.sort((a, b) => a - b);\n}\n\nfunction {{within}}({{items}}: number[], {{low}}: number, {{high}}: number) {\n  return {{select}}({{items}}, {{low}}).filter({{value}} => {\n    return {{value}} <= {{high}};\n  });\n}\n\nconst {{data}} = [4, 8, 15, 16, 23, 42];\nconst {{output}} = {{within}}({{data}}, 10, 30);\nfor (const {{entry}} of {{output}}) {\n  console.log({{entry}});\n}"
    },
    {
      "title": "Частота слов",
      "short": "function {{frequency}}({{words}}: string[]) {\n  const {{result}} = new Map<string, number>();\n  for (const {{word}} of {{words}}) {\n    {{result}}.set({{word}}, ({{result}}.get({{word}}) ?? 0) + 1);\n  }\n  return {{result}};\n}",
      "medium": "function {{frequency}}({{words}}: string[]) {\n  const {{result}} = new Map<string, number>();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if (!{{key}}) {\n      continue;\n    }\n    const {{count}} = {{result}}.get({{key}}) ?? 0;\n    {{result}}.set({{key}}, {{count}} + 1);\n  }\n  return {{result}};\n}",
      "long": "function {{frequency}}({{words}}: string[]) {\n  const {{result}} = new Map<string, number>();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if (!{{key}}) {\n      continue;\n    }\n    const {{count}} = {{result}}.get({{key}}) ?? 0;\n    {{result}}.set({{key}}, {{count}} + 1);\n  }\n  return {{result}};\n}\n\nfunction {{ranking}}({{words}}: string[]) {\n  const {{data}} = [...{{frequency}}({{words}})];\n  return {{data}}.sort((a, b) => b[1] - a[1]);\n}\n\nconst {{text}} = \"build test build review test build\";\nconst {{output}} = {{ranking}}({{text}}.split(\" \"));\nfor (const [{{key}}, {{count}}] of {{output}}) {\n  console.log({{key}}, {{count}});\n}"
    },
    {
      "title": "Поиск элемента",
      "short": "function {{find}}({{items}}: number[], {{limit}}: number) {\n  return {{items}}.find({{value}} => {{value}} > {{limit}}) ?? null;\n}",
      "medium": "function {{find}}({{items}}: number[], {{limit}}: number) {\n  for (let {{index}} = 0; {{index}} < {{items}}.length; {{index}}++) {\n    const {{value}} = {{items}}[{{index}}];\n    if ({{value}} > {{limit}}) {\n      return { index: {{index}}, value: {{value}} };\n    }\n  }\n  return null;\n}",
      "long": "function {{find}}({{items}}: number[], {{limit}}: number) {\n  for (let {{index}} = 0; {{index}} < {{items}}.length; {{index}}++) {\n    const {{value}} = {{items}}[{{index}}];\n    if ({{value}} > {{limit}}) {\n      return { index: {{index}}, value: {{value}} };\n    }\n  }\n  return null;\n}\n\nfunction {{describe}}({{record}}: { index: number; value: number } | null) {\n  if ({{record}} === null) {\n    return \"No matching entry\";\n  }\n  return `Index: ${ {{record}}.index }, value: ${ {{record}}.value }`;\n}\n\nconst {{data}} = [3, 7, 11, 19];\nconst {{found}} = {{find}}({{data}}, 10);\nconst {{output}} = {{describe}}({{found}});\nconsole.log({{output}});"
    },
    {
      "title": "Очистка и сортировка строк",
      "short": "function {{normalize}}({{words}}: string[]) {\n  return {{words}}.map({{word}} => {{word}}.trim().toLowerCase());\n}",
      "medium": "function {{normalize}}({{words}}: string[]) {\n  const {{result}} = new Set<string>();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if ({{key}}.length > 0) {\n      {{result}}.add({{key}});\n    }\n  }\n  return [...{{result}}].sort();\n}",
      "long": "function {{normalize}}({{words}}: string[]) {\n  const {{result}} = new Set<string>();\n  for (const {{word}} of {{words}}) {\n    const {{key}} = {{word}}.trim().toLowerCase();\n    if ({{key}}.length > 0) {\n      {{result}}.add({{key}});\n    }\n  }\n  return [...{{result}}].sort();\n}\n\nfunction {{group}}({{words}}: string[]) {\n  const {{result}}: Record<string, string[]> = {};\n  for (const {{word}} of {{normalize}}({{words}})) {\n    const {{key}} = {{word}}[0];\n    {{result}}[{{key}}] ??= [];\n    {{result}}[{{key}}].push({{word}});\n  }\n  return {{result}};\n}\n\nconst {{data}} = [\" Beta \", \"alpha\", \"beta\", \"delta\"];\nconst {{output}} = {{group}}({{data}});\nconsole.log(JSON.stringify({{output}}, null, 2));"
    }
  ],
  "python": [
    {
      "title": "Сумма и среднее",
      "short": "def {{sum}}({{items}}):\n    return sum({{items}})",
      "medium": "def {{sum}}({{items}}):\n    {{result}} = 0\n    for {{value}} in {{items}}:\n        if {{value}} >= 0:\n            {{result}} += {{value}}\n    return {{result}}",
      "long": "def {{sum}}({{items}}):\n    {{result}} = 0\n    for {{value}} in {{items}}:\n        if {{value}} >= 0:\n            {{result}} += {{value}}\n    return {{result}}\n\n\ndef {{average}}({{items}}):\n    if not {{items}}:\n        return 0\n    return {{sum}}({{items}}) / len({{items}})\n\n\n{{data}} = [12, 18, 24, 30]\n{{output}} = {\n    \"total\": {{sum}}({{data}}),\n    \"average\": {{average}}({{data}}),\n}\nprint({{output}})"
    },
    {
      "title": "Фильтрация по порогу",
      "short": "def {{select}}({{items}}, {{limit}}):\n    return [{{value}} for {{value}} in {{items}} if {{value}} >= {{limit}}]",
      "medium": "def {{select}}({{items}}, {{limit}}):\n    {{result}} = []\n    for {{value}} in {{items}}:\n        if {{value}} >= {{limit}}:\n            {{result}}.append({{value}})\n    return sorted({{result}})",
      "long": "def {{select}}({{items}}, {{limit}}):\n    {{result}} = []\n    for {{value}} in {{items}}:\n        if {{value}} >= {{limit}}:\n            {{result}}.append({{value}})\n    return sorted({{result}})\n\n\ndef {{within}}({{items}}, {{low}}, {{high}}):\n    return [\n        {{value}} for {{value}} in {{select}}({{items}}, {{low}})\n        if {{value}} <= {{high}}\n    ]\n\n\n{{data}} = [4, 8, 15, 16, 23, 42]\n{{output}} = {{within}}({{data}}, 10, 30)\nfor {{entry}} in {{output}}:\n    print({{entry}})"
    },
    {
      "title": "Частота слов",
      "short": "def {{frequency}}({{words}}):\n    {{result}} = {}\n    for {{word}} in {{words}}:\n        {{result}}[{{word}}] = {{result}}.get({{word}}, 0) + 1\n    return {{result}}",
      "medium": "def {{frequency}}({{words}}):\n    {{result}} = {}\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip().lower()\n        if not {{key}}:\n            continue\n        {{result}}[{{key}}] = {{result}}.get({{key}}, 0) + 1\n    return {{result}}",
      "long": "def {{frequency}}({{words}}):\n    {{result}} = {}\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip().lower()\n        if not {{key}}:\n            continue\n        {{result}}[{{key}}] = {{result}}.get({{key}}, 0) + 1\n    return {{result}}\n\n\ndef {{ranking}}({{words}}):\n    {{data}} = {{frequency}}({{words}})\n    return sorted({{data}}.items(), key=lambda pair: -pair[1])\n\n\n{{text}} = \"build test build review test build\"\n{{output}} = {{ranking}}({{text}}.split())\nfor {{key}}, {{count}} in {{output}}:\n    print(f\"{ {{key}} }: { {{count}} }\")"
    },
    {
      "title": "Поиск элемента",
      "short": "def {{find}}({{items}}, {{limit}}):\n    return next(({{value}} for {{value}} in {{items}} if {{value}} > {{limit}}), None)",
      "medium": "def {{find}}({{items}}, {{limit}}):\n    for {{index}}, {{value}} in enumerate({{items}}):\n        if {{value}} > {{limit}}:\n            return {\"index\": {{index}}, \"value\": {{value}}}\n    return None",
      "long": "def {{find}}({{items}}, {{limit}}):\n    for {{index}}, {{value}} in enumerate({{items}}):\n        if {{value}} > {{limit}}:\n            return {\"index\": {{index}}, \"value\": {{value}}}\n    return None\n\n\ndef {{describe}}({{record}}):\n    if {{record}} is None:\n        return \"No matching entry\"\n    {{index}} = {{record}}[\"index\"]\n    {{value}} = {{record}}[\"value\"]\n    return f\"Index: { {{index}} }, value: { {{value}} }\"\n\n\n{{data}} = [3, 7, 11, 19]\n{{found}} = {{find}}({{data}}, 10)\nprint({{describe}}({{found}}))"
    },
    {
      "title": "Очистка и сортировка строк",
      "short": "def {{normalize}}({{words}}):\n    return [{{word}}.strip().lower() for {{word}} in {{words}}]",
      "medium": "def {{normalize}}({{words}}):\n    {{result}} = set()\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip().lower()\n        if {{key}}:\n            {{result}}.add({{key}})\n    return sorted({{result}})",
      "long": "def {{normalize}}({{words}}):\n    {{result}} = set()\n    for {{word}} in {{words}}:\n        {{key}} = {{word}}.strip().lower()\n        if {{key}}:\n            {{result}}.add({{key}})\n    return sorted({{result}})\n\n\ndef {{group}}({{words}}):\n    {{result}} = {}\n    for {{word}} in {{normalize}}({{words}}):\n        {{key}} = {{word}}[0]\n        {{result}}.setdefault({{key}}, []).append({{word}})\n    return {{result}}\n\n\n{{data}} = [\" Beta \", \"alpha\", \"beta\", \"delta\"]\n{{output}} = {{group}}({{data}})\nfor {{key}}, {{words}} in sorted({{output}}.items()):\n    print({{key}}, \", \".join({{words}}))"
    }
  ],
  "c": [
    {
      "title": "Сумма и среднее",
      "short": "int {{sum}}(const int *{{items}},\n    int {{count}}) {\n  int {{result}} = 0;\n  for (int {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    {{result}} += {{items}}[{{index}}];\n  }\n  return {{result}};\n}",
      "medium": "#include <stddef.h>\n\nlong {{sum}}(const int *{{items}},\n    size_t {{count}}) {\n  if ({{items}} == NULL) {\n    return 0;\n  }\n  long {{result}} = 0;\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    {{result}} += {{items}}[{{index}}];\n  }\n  return {{result}};\n}",
      "long": "#include <stdio.h>\n#include <stddef.h>\n\nlong {{sum}}(const int *{{items}},\n    size_t {{count}}) {\n  if ({{items}} == NULL) {\n    return 0;\n  }\n  long {{result}} = 0;\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    {{result}} += {{items}}[{{index}}];\n  }\n  return {{result}};\n}\n\ndouble {{average}}(const int *{{items}},\n    size_t {{count}}) {\n  return {{count}} ? (double) {{sum}}({{items}}, {{count}}) / {{count}} : 0.0;\n}\n\nint main(void) {\n  const int {{data}}[] = {12, 18, 24, 30};\n  size_t {{count}} = sizeof({{data}}) / sizeof({{data}}[0]);\n  printf(\"Total: %ld\\n\", {{sum}}({{data}}, {{count}}));\n  printf(\"Average: %.2f\\n\", {{average}}({{data}}, {{count}}));\n  return 0;\n}"
    },
    {
      "title": "Фильтрация массива",
      "short": "int {{select}}(const int *{{items}},\n    int {{count}},\n    int {{limit}}) {\n  int {{result}} = 0;\n  for (int {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    {{result}} += {{items}}[{{index}}] >= {{limit}};\n  }\n  return {{result}};\n}",
      "medium": "#include <stddef.h>\n\nsize_t {{select}}(const int *{{items}},\n    size_t {{count}},\n    int {{limit}},\n                int *{{output}}) {\n  size_t {{result}} = 0;\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    int {{value}} = {{items}}[{{index}}];\n    if ({{value}} >= {{limit}}) {\n      {{output}}[{{result}}++] = {{value}};\n    }\n  }\n  return {{result}};\n}",
      "long": "#include <stdio.h>\n#include <stddef.h>\n\nsize_t {{select}}(const int *{{items}},\n    size_t {{count}},\n    int {{limit}},\n                int *{{output}}) {\n  size_t {{result}} = 0;\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    int {{value}} = {{items}}[{{index}}];\n    if ({{value}} >= {{limit}}) {\n      {{output}}[{{result}}++] = {{value}};\n    }\n  }\n  return {{result}};\n}\n\nint main(void) {\n  const int {{data}}[] = {4, 8, 15, 16, 23, 42};\n  int {{output}}[6] = {0};\n  size_t {{count}} = {{select}}({{data}}, 6, 10, {{output}});\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    printf(\"%d\\n\", {{output}}[{{index}}]);\n  }\n  return 0;\n}"
    },
    {
      "title": "Частота символа",
      "short": "int {{frequency}}(const char *{{text}}, char {{key}}) {\n  int {{count}} = 0;\n  while (*{{text}}) {\n    {{count}} += *{{text}}++ == {{key}};\n  }\n  return {{count}};\n}",
      "medium": "#include <stddef.h>\n#include <ctype.h>\n\nsize_t {{frequency}}(const char *{{text}}, char {{key}}) {\n  size_t {{count}} = 0;\n  if ({{text}} == NULL) {\n    return 0;\n  }\n  while (*{{text}}) {\n    unsigned char {{value}} = (unsigned char) *{{text}}++;\n    {{count}} += tolower({{value}}) == tolower((unsigned char) {{key}});\n  }\n  return {{count}};\n}",
      "long": "#include <stdio.h>\n#include <stddef.h>\n#include <ctype.h>\n\nsize_t {{frequency}}(const char *{{text}}, char {{key}}) {\n  size_t {{count}} = 0;\n  if ({{text}} == NULL) {\n    return 0;\n  }\n  while (*{{text}}) {\n    unsigned char {{value}} = (unsigned char) *{{text}}++;\n    {{count}} += tolower({{value}}) == tolower((unsigned char) {{key}});\n  }\n  return {{count}};\n}\n\nint main(void) {\n  const char *{{text}} = \"Build test build review\";\n  const char {{words}}[] = \"aeiou\";\n  for (size_t {{index}} = 0; {{words}}[{{index}}]; ++{{index}}) {\n    char {{key}} = {{words}}[{{index}}];\n    size_t {{count}} = {{frequency}}({{text}}, {{key}});\n    printf(\"%c: %zu\\n\", {{key}}, {{count}});\n  }\n  return 0;\n}"
    },
    {
      "title": "Поиск элемента",
      "short": "int {{find}}(const int *{{items}},\n    int {{count}},\n    int {{limit}}) {\n  for (int {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    if ({{items}}[{{index}}] > {{limit}}) {\n      return {{index}};\n    }\n  }\n  return -1;\n}",
      "medium": "#include <stddef.h>\n#include <stdbool.h>\n\nbool {{find}}(const int *{{items}},\n    size_t {{count}},\n    int {{limit}},\n              size_t *{{found}}) {\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    if ({{items}}[{{index}}] > {{limit}}) {\n      *{{found}} = {{index}};\n      return true;\n    }\n  }\n  return false;\n}",
      "long": "#include <stdio.h>\n#include <stddef.h>\n#include <stdbool.h>\n\nbool {{find}}(const int *{{items}},\n    size_t {{count}},\n    int {{limit}},\n              size_t *{{found}}) {\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    if ({{items}}[{{index}}] > {{limit}}) {\n      *{{found}} = {{index}};\n      return true;\n    }\n  }\n  return false;\n}\n\nint main(void) {\n  const int {{data}}[] = {3, 7, 11, 19};\n  size_t {{index}} = 0;\n  if ({{find}}({{data}}, 4, 10, &{{index}})) {\n    printf(\"Index: %zu, value: %d\\n\", {{index}}, {{data}}[{{index}}]);\n  } else {\n    puts(\"No matching entry\");\n  }\n  return 0;\n}"
    },
    {
      "title": "Преобразование строки",
      "short": "void {{normalize}}(char *{{text}}) {\n  while (*{{text}}) {\n    if (*{{text}} >= 'A' && *{{text}} <= 'Z') {\n      *{{text}} += 'a' - 'A';\n    }\n    ++{{text}};\n  }\n}",
      "medium": "#include <ctype.h>\n#include <stddef.h>\n\nsize_t {{normalize}}(char *{{text}}) {\n  size_t {{count}} = 0;\n  if ({{text}} == NULL) {\n    return 0;\n  }\n  for (size_t {{index}} = 0; {{text}}[{{index}}]; ++{{index}}) {\n    unsigned char {{value}} = (unsigned char) {{text}}[{{index}}];\n    {{text}}[{{count}}++] = (char) tolower({{value}});\n  }\n  {{text}}[{{count}}] = '\\0';\n  return {{count}};\n}",
      "long": "#include <stdio.h>\n#include <ctype.h>\n#include <stddef.h>\n\nsize_t {{normalize}}(char *{{text}}) {\n  size_t {{count}} = 0;\n  if ({{text}} == NULL) {\n    return 0;\n  }\n  for (size_t {{index}} = 0; {{text}}[{{index}}]; ++{{index}}) {\n    unsigned char {{value}} = (unsigned char) {{text}}[{{index}}];\n    {{text}}[{{count}}++] = (char) tolower({{value}});\n  }\n  {{text}}[{{count}}] = '\\0';\n  return {{count}};\n}\n\nint main(void) {\n  char {{data}}[] = \"BUILD AND REVIEW\";\n  size_t {{count}} = {{normalize}}({{data}});\n  printf(\"Text: %s\\n\", {{data}});\n  printf(\"Length: %zu\\n\", {{count}});\n  for (size_t {{index}} = 0; {{index}} < {{count}}; ++{{index}}) {\n    printf(\"%c\", {{data}}[{{index}}]);\n  }\n  putchar('\\n');\n  return 0;\n}"
    }
  ],
  "cpp": [
    {
      "title": "Сумма и среднее",
      "short": "#include <numeric>\n#include <vector>\n\nint {{sum}}(const std::vector<int>& {{items}}) {\n  return std::accumulate({{items}}.begin(), {{items}}.end(), 0);\n}",
      "medium": "#include <vector>\n\nlong {{sum}}(const std::vector<int>& {{items}}) {\n  long {{result}} = 0;\n  for (int {{value}} : {{items}}) {\n    if ({{value}} >= 0) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}",
      "long": "#include <iostream>\n#include <vector>\n\nlong {{sum}}(const std::vector<int>& {{items}}) {\n  long {{result}} = 0;\n  for (int {{value}} : {{items}}) {\n    if ({{value}} >= 0) {\n      {{result}} += {{value}};\n    }\n  }\n  return {{result}};\n}\n\ndouble {{average}}(const std::vector<int>& {{items}}) {\n  if ({{items}}.empty()) {\n    return 0.0;\n  }\n  return static_cast<double>({{sum}}({{items}})) / {{items}}.size();\n}\n\nint main() {\n  std::vector<int> {{data}} = {12, 18, 24, 30};\n  std::cout << {{sum}}({{data}}) << '\\n';\n  std::cout << {{average}}({{data}}) << '\\n';\n}"
    },
    {
      "title": "Фильтрация массива",
      "short": "#include <vector>\n\nstd::vector<int> {{select}}(const std::vector<int>& {{items}},\n    int {{limit}}) {\n  std::vector<int> {{result}};\n  for (int {{value}} : {{items}}) {\n    if ({{value}} >= {{limit}}) {{result}}.push_back({{value}});\n  }\n  return {{result}};\n}",
      "medium": "#include <algorithm>\n#include <vector>\n\nstd::vector<int> {{select}}(const std::vector<int>& {{items}},\n    int {{limit}}) {\n  std::vector<int> {{result}};\n  for (int {{value}} : {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push_back({{value}});\n    }\n  }\n  std::sort({{result}}.begin(), {{result}}.end());\n  return {{result}};\n}",
      "long": "#include <iostream>\n#include <algorithm>\n#include <vector>\n\nstd::vector<int> {{select}}(const std::vector<int>& {{items}},\n    int {{limit}}) {\n  std::vector<int> {{result}};\n  for (int {{value}} : {{items}}) {\n    if ({{value}} >= {{limit}}) {\n      {{result}}.push_back({{value}});\n    }\n  }\n  std::sort({{result}}.begin(), {{result}}.end());\n  return {{result}};\n}\n\nstd::vector<int> {{within}}(const std::vector<int>& {{items}},\n                          int {{low}}, int {{high}}) {\n  auto {{result}} = {{select}}({{items}}, {{low}});\n  {{result}}.erase(std::remove_if({{result}}.begin(), {{result}}.end(),\n      [{{high}}](int {{value}}) { return {{value}} > {{high}}; }), {{result}}.end());\n  return {{result}};\n}\n\nint main() {\n  std::vector<int> {{data}} = {4, 8, 15, 16, 23, 42};\n  for (int {{value}} : {{within}}({{data}}, 10, 30)) {\n    std::cout << {{value}} << '\\n';\n  }\n}"
    },
    {
      "title": "Частота слов",
      "short": "#include <map>\n#include <string>\n#include <vector>\n\nstd::map<std::string, int> {{frequency}}(const std::vector<std::string>& {{words}}) {\n  std::map<std::string, int> {{result}};\n  for (const auto& {{word}} : {{words}}) ++{{result}}[{{word}}];\n  return {{result}};\n}",
      "medium": "#include <map>\n#include <string>\n#include <vector>\n\nstd::map<std::string, int> {{frequency}}(const std::vector<std::string>& {{words}}) {\n  std::map<std::string, int> {{result}};\n  for (const auto& {{word}} : {{words}}) {\n    if (!{{word}}.empty()) {\n      ++{{result}}[{{word}}];\n    }\n  }\n  return {{result}};\n}",
      "long": "#include <iostream>\n#include <map>\n#include <string>\n#include <vector>\n\nstd::map<std::string, int> {{frequency}}(const std::vector<std::string>& {{words}}) {\n  std::map<std::string, int> {{result}};\n  for (const auto& {{word}} : {{words}}) {\n    if (!{{word}}.empty()) {\n      ++{{result}}[{{word}}];\n    }\n  }\n  return {{result}};\n}\n\nint main() {\n  std::vector<std::string> {{data}} = {\n    \"build\", \"test\", \"build\", \"review\", \"test\"\n  };\n  auto {{output}} = {{frequency}}({{data}});\n  for (const auto& [{{key}}, {{count}}] : {{output}}) {\n    std::cout << {{key}} << \": \" << {{count}} << '\\n';\n  }\n  std::cout << \"Unique: \" << {{output}}.size() << '\\n';\n}"
    },
    {
      "title": "Поиск элемента",
      "short": "#include <vector>\n\nint {{find}}(const std::vector<int>& {{items}},\n    int {{limit}}) {\n  for (int {{index}} = 0; {{index}} < static_cast<int>({{items}}.size()); ++{{index}}) {\n    if ({{items}}[{{index}}] > {{limit}}) return {{index}};\n  }\n  return -1;\n}",
      "medium": "#include <optional>\n#include <vector>\n\nstd::optional<int> {{find}}(const std::vector<int>& {{items}},\n    int {{limit}}) {\n  if ({{items}}.empty()) {\n    return std::nullopt;\n  }\n  for (int {{value}} : {{items}}) {\n    if ({{value}} > {{limit}}) {\n      return {{value}};\n    }\n  }\n  return std::nullopt;\n}",
      "long": "#include <iostream>\n#include <optional>\n#include <vector>\n\nstd::optional<int> {{find}}(const std::vector<int>& {{items}},\n    int {{limit}}) {\n  if ({{items}}.empty()) {\n    return std::nullopt;\n  }\n  for (int {{value}} : {{items}}) {\n    if ({{value}} > {{limit}}) {\n      return {{value}};\n    }\n  }\n  return std::nullopt;\n}\n\nint main() {\n  std::vector<int> {{data}} = {3, 7, 11, 19};\n  auto {{found}} = {{find}}({{data}}, 10);\n  if ({{found}}.has_value()) {\n    std::cout << \"Found: \" << *{{found}} << '\\n';\n  } else {\n    std::cout << \"No matching entry\\n\";\n  }\n}"
    },
    {
      "title": "Преобразование и группировка",
      "short": "#include <algorithm>\n#include <cctype>\n#include <string>\n\nstd::string {{normalize}}(std::string {{text}}) {\n  std::transform({{text}}.begin(), {{text}}.end(), {{text}}.begin(),\n      [](unsigned char {{value}}) { return std::tolower({{value}}); });\n  return {{text}};\n}",
      "medium": "#include <algorithm>\n#include <cctype>\n#include <set>\n#include <string>\n#include <vector>\n\nstd::set<std::string> {{normalize}}(const std::vector<std::string>& {{words}}) {\n  std::set<std::string> {{result}};\n  for (auto {{word}} : {{words}}) {\n    std::transform({{word}}.begin(), {{word}}.end(), {{word}}.begin(),\n        [](unsigned char {{value}}) { return std::tolower({{value}}); });\n    if (!{{word}}.empty()) {{result}}.insert({{word}});\n  }\n  return {{result}};\n}",
      "long": "#include <iostream>\n#include <map>\n#include <algorithm>\n#include <cctype>\n#include <set>\n#include <string>\n#include <vector>\n\nstd::set<std::string> {{normalize}}(const std::vector<std::string>& {{words}}) {\n  std::set<std::string> {{result}};\n  for (auto {{word}} : {{words}}) {\n    std::transform({{word}}.begin(), {{word}}.end(), {{word}}.begin(),\n        [](unsigned char {{value}}) { return std::tolower({{value}}); });\n    if (!{{word}}.empty()) {{result}}.insert({{word}});\n  }\n  return {{result}};\n}\n\nstd::map<char, std::vector<std::string>> {{group}}(const std::vector<std::string>& {{words}}) {\n  std::map<char, std::vector<std::string>> {{result}};\n  for (const auto& {{word}} : {{normalize}}({{words}})) {\n    {{result}}[{{word}}.front()].push_back({{word}});\n  }\n  return {{result}};\n}\n\nint main() {\n  std::vector<std::string> {{data}} = {\"Beta\", \"alpha\", \"beta\", \"delta\"};\n  for (const auto& [{{key}}, {{words}}] : {{group}}({{data}})) {\n    std::cout << {{key}} << \": \" << {{words}}.size() << '\\n';\n  }\n}"
    }
  ]
};
