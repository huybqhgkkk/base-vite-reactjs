import React from "react";
import reactLogo from '/assets/react.svg';
import viteLogo from '/public/assets/vite.svg';
import {useTranslation} from "react-i18next";
export default function Home() {
    const { t } = useTranslation();

    return(
        <div>
            <div className="flex">
                <a href="#" className="w-60">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <h1 className="text-green-500 myGreen">Tailwind</h1>
            <h1 className="text-3xl mt-6 p-25 p-3.5">
                Redux toolkit
            </h1>
            <h1 className="text-3xl mt-6 p-25 p-3.5">
                {t('welcome')}
            </h1>
            <h1 className="text-3xl mt-6 p-25 p-3.5">
                {t('description')}
            </h1>

        </div>

    )
}