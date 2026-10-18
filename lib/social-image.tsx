import { ImageResponse } from 'next/og';

export const socialImageSize = {
    width: 1200,
    height: 630,
};

export function renderSocialImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                    overflow: 'hidden',
                    alignItems: 'center',
                    padding: '72px 82px',
                    background: '#1A0F14',
                    color: '#F6EFE4',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width: 680,
                        height: 680,
                        right: -190,
                        top: -300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #C41E3A55 0%, #1A0F1400 70%)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: 520,
                        height: 520,
                        left: 390,
                        bottom: -420,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #C9A15B35 0%, #1A0F1400 70%)',
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', width: 660, zIndex: 1 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            color: '#D8B66E',
                            fontSize: 23,
                            fontWeight: 600,
                            letterSpacing: 1,
                        }}
                    >
                        <span style={{ fontSize: 32 }}>✦</span>
                        MAKE &amp; WISH
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: 36,
                            fontFamily: 'serif',
                            fontSize: 68,
                            fontWeight: 600,
                            lineHeight: 1.08,
                            letterSpacing: -2,
                        }}
                    >
                        <span>Des vœux qui</span>
                        <span style={{ color: '#E2B976', fontStyle: 'italic' }}>viennent du cœur.</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: 24,
                            maxWidth: 580,
                            color: '#D9CCD0',
                            fontSize: 25,
                            lineHeight: 1.45,
                        }}
                    >
                        Créez une carte personnalisée pour chaque occasion, avec l’aide de l’IA.
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: 35,
                            padding: '12px 20px',
                            border: '1px solid #D8B66E77',
                            borderRadius: 999,
                            color: '#E7C98B',
                            fontSize: 18,
                            letterSpacing: 1,
                        }}
                    >
                        CRÉEZ · PERSONNALISEZ · PARTAGEZ
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        right: 95,
                        top: 105,
                        width: 315,
                        height: 420,
                        transform: 'rotate(7deg)',
                        padding: 13,
                        border: '1px solid #F6EFE455',
                        borderRadius: 20,
                        background: '#F6EFE4',
                        boxShadow: '0 28px 70px #00000066',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            padding: 24,
                            border: '1px solid #8E1B2E55',
                            background: 'linear-gradient(155deg, #FFF9ED 0%, #F4E5D2 100%)',
                            color: '#451B28',
                            textAlign: 'center',
                        }}
                    >
                        <span style={{ color: '#A32B3F', fontSize: 34 }}>✦</span>
                        <span
                            style={{
                                display: 'flex',
                                marginTop: 23,
                                fontFamily: 'serif',
                                fontSize: 30,
                                fontStyle: 'italic',
                            }}
                        >
                            Une pensée pour toi
                        </span>
                        <span
                            style={{
                                display: 'flex',
                                width: 115,
                                height: 2,
                                marginTop: 20,
                                background: '#C9A15B',
                            }}
                        />
                        <span style={{ display: 'flex', marginTop: 22, color: '#76515A', fontSize: 18 }}>
                            Les plus beaux moments méritent de beaux mots.
                        </span>
                        <span style={{ display: 'flex', marginTop: 25, color: '#A32B3F', fontSize: 30 }}>♥</span>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        right: 55,
                        bottom: 72,
                        width: 58,
                        height: 58,
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #D8B66E99',
                        borderRadius: '50%',
                        background: '#2B171F',
                        color: '#E2B976',
                        fontSize: 30,
                    }}
                >
                    ✦
                </div>
            </div>
        ),
        socialImageSize
    );
}
