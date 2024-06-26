module.exports = {
    mode: "jit",
    purge: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
        minWidth: {
            0: "0",
            "1/4": "25%",
            "1/2": "50%",
            "3/4": "75%",
            full: "100%",
        },
        backgroundColor: (theme) => ({
            ...theme("colors"),
            "green-theme": "#f0f8ff",
        }),
    },
    variants: {
        extend: {},
    },
    plugins: [
        function ({ addComponents }) {
            addComponents({
                ".container": {
                    maxWidth: "100%",
                    "@screen sm": {
                        maxWidth: "600px",
                    },
                    "@screen md": {
                        maxWidth: "700px",
                    },
                    "@screen lg": {
                        maxWidth: "800px",
                    },
                    "@screen xl": {
                        maxWidth: "1000px",
                    },
                },
            });
        },
    ],
};
