import React from "react";
import reactLogo from '/assets/react.svg';
import { useTranslation } from "react-i18next";

export default function Home() {
    const { t } = useTranslation();

    return (
        <div className="px-4 py-6">
            <div className="flex">
                <a href="#" className="w-16 sm:w-24">
                    <img src={reactLogo} className="w-full" alt="React logo" />
                </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-4">Vite + React</h1>
            <h1 className="text-2xl sm:text-3xl text-green-500 mt-2">Tailwind</h1>
            <h1 className="text-xl sm:text-3xl mt-4">Redux toolkit</h1>
            <h1 className="text-xl sm:text-3xl mt-4">{t('welcome')}</h1>
            <h1 className="text-xl sm:text-3xl mt-4">{t('description')}</h1>
        </div>
    );
}
