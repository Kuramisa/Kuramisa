import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    sonarjs.configs.recommended,
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
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/no-nested-conditional": "off",
            "sonarjs/no-small-switch": "warn",
            "sonarjs/no-nested-template-literals": "off",
        },
    }
);
