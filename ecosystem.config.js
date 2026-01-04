module.exports = {
    apps: [
        {
            name: "prompt-master-pro",
            script: "npm",
            args: "start -- -H 0.0.0.0",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
