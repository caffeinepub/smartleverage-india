import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TaxCalculation {
    ltcg: number;
    stcg: number;
    interestDeduction: number;
}
export interface EstatePlan {
    heirsCount: bigint;
    estateValue: number;
    timestamp: Time;
    distributionStrategy: string;
}
export type Time = bigint;
export interface LeverageScenario {
    borrowRate: number;
    portfolioValue: number;
    targetYield: number;
    horizonYears: number;
    ltvRatio: number;
    timestamp: Time;
    assetType: string;
    borrowAmount: number;
}
export interface UserData {
    leverageScenarios: Array<LeverageScenario>;
    estatePlans: Array<EstatePlan>;
    taxCalculations: Array<TaxCalculation>;
    alertPrefs?: AlertPrefs;
}
export interface AlertPrefs {
    borrowRateThreshold: number;
    ltvThreshold: number;
}
export interface backendInterface {
    calculateLeverageMetrics(borrowAmount: number, borrowRate: number, targetYield: number, ltvRatio: number): Promise<{
        netSpread: number;
        marginCallTrigger: number;
        verdict: string;
        effectiveReturn: number;
        riskScore: number;
    }>;
    getAlertPrefs(): Promise<AlertPrefs | null>;
    getEstatePlans(): Promise<Array<EstatePlan>>;
    getLeverageScenarios(): Promise<Array<LeverageScenario>>;
    getTaxCalculations(): Promise<Array<TaxCalculation>>;
    getUserData(): Promise<UserData | null>;
    saveEstatePlan(plan: EstatePlan): Promise<void>;
    saveLeverageScenario(scenario: LeverageScenario): Promise<void>;
    saveTaxCalculation(tax: TaxCalculation): Promise<void>;
    setAlertPrefs(prefs: AlertPrefs): Promise<void>;
}
