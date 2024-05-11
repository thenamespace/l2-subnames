interface IAppConfiguration {
    VERIFIER_WALLET: string
    APP_PORT: number
    ALCHEMY_KEY: string
}

export const AppConfiguration: IAppConfiguration = {
    APP_PORT: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 0,
    VERIFIER_WALLET: process.env.VERIFIER_WALLET || "",
    ALCHEMY_KEY: process.env.ALCHEMY_KEY || ""
}