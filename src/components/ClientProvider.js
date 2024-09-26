"use client";

import { RecoilRoot } from 'recoil';

export default function ClientProvider({ children }) {
    return (
        <RecoilRoot>
            {children}
        </RecoilRoot>
    );
}
