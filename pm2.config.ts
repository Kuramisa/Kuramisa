export default {
    apps: [
        {
            name: "Kuramisa",
            script: "./dist/index.js",
            watch: true,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
