module.exports = {
    apps: [
        {
            name: "Kuramisa",
            script: "pnpm",
            args: "start",
            autorestart: true,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
