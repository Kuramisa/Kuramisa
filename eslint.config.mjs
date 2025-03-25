import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    sonarjs.configs.recommended,
    eslintConfigPrettier,
    eslintPluginPrettier,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    args: "all",
                    vars: "all",
                    argsIgnorePattern: "^_",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/consistent-type-imports": "error",
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/no-nested-conditional": "off",
            "sonarjs/no-small-switch": "warn",
            "sonarjs/no-nested-template-literals": "off",
            "sonarjs/no-unused-vars": "warn",
            "sonarjs/no-dead-store": "warn",
            "sonarjs/unused-import": "warn",
            "sonarjs/todo-tag": "warn",
            "sonarjs/no-commented-code": "warn",
        },
    },
);
