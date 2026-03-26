import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";

actor {
  type LeverageScenario = {
    portfolioValue : Float;
    borrowAmount : Float;
    borrowRate : Float;
    targetYield : Float;
    ltvRatio : Float;
    horizonYears : Float;
    assetType : Text;
    timestamp : Time.Time;
  };

  module LeverageScenario {
    public func compare(scenario1 : LeverageScenario, scenario2 : LeverageScenario) : Order.Order {
      switch (Float.compare(scenario1.portfolioValue, scenario2.portfolioValue)) {
        case (#equal) { Float.compare(scenario1.borrowAmount, scenario2.borrowAmount) };
        case (order) { order };
      };
    };
  };

  type TaxCalculation = {
    stcg : Float;
    ltcg : Float;
    interestDeduction : Float;
  };

  module TaxCalculation {
    public func compare(calc1 : TaxCalculation, calc2 : TaxCalculation) : Order.Order {
      Float.compare(calc1.stcg, calc2.stcg);
    };
  };

  type EstatePlan = {
    heirsCount : Nat;
    estateValue : Float;
    distributionStrategy : Text;
    timestamp : Time.Time;
  };

  module EstatePlan {
    public func compare(plan1 : EstatePlan, plan2 : EstatePlan) : Order.Order {
      Float.compare(plan1.estateValue, plan2.estateValue);
    };
  };

  type AlertPrefs = {
    borrowRateThreshold : Float;
    ltvThreshold : Float;
  };

  module AlertPrefs {
    public func compare(prefs1 : AlertPrefs, prefs2 : AlertPrefs) : Order.Order {
      Float.compare(prefs1.borrowRateThreshold, prefs2.borrowRateThreshold);
    };
  };

  type UserData = {
    leverageScenarios : [LeverageScenario];
    taxCalculations : [TaxCalculation];
    estatePlans : [EstatePlan];
    alertPrefs : ?AlertPrefs;
  };

  module UserData {
    public func compare(user1 : UserData, user2 : UserData) : Order.Order {
      Int.compare(user1.leverageScenarios.size(), user2.leverageScenarios.size());
    };
  };

  let users = Map.empty<Principal, UserData>();

  public shared ({ caller }) func saveLeverageScenario(scenario : LeverageScenario) : async () {
    let userData = switch (users.get(caller)) {
      case (null) {
        {
          leverageScenarios = [scenario];
          taxCalculations = [];
          estatePlans = [];
          alertPrefs = null;
        };
      };
      case (?data) {
        {
          leverageScenarios = data.leverageScenarios.concat([scenario]);
          taxCalculations = data.taxCalculations;
          estatePlans = data.estatePlans;
          alertPrefs = data.alertPrefs;
        };
      };
    };
    users.add(caller, userData);
  };

  public query ({ caller }) func getLeverageScenarios() : async [LeverageScenario] {
    switch (users.get(caller)) {
      case (null) { [] };
      case (?data) { data.leverageScenarios };
    };
  };

  public shared ({ caller }) func saveTaxCalculation(tax : TaxCalculation) : async () {
    let userData = switch (users.get(caller)) {
      case (null) {
        {
          leverageScenarios = [];
          taxCalculations = [tax];
          estatePlans = [];
          alertPrefs = null;
        };
      };
      case (?data) {
        {
          leverageScenarios = data.leverageScenarios;
          taxCalculations = data.taxCalculations.concat([tax]);
          estatePlans = data.estatePlans;
          alertPrefs = data.alertPrefs;
        };
      };
    };
    users.add(caller, userData);
  };

  public query ({ caller }) func getTaxCalculations() : async [TaxCalculation] {
    switch (users.get(caller)) {
      case (null) { [] };
      case (?data) { data.taxCalculations };
    };
  };

  public shared ({ caller }) func saveEstatePlan(plan : EstatePlan) : async () {
    let userData = switch (users.get(caller)) {
      case (null) {
        {
          leverageScenarios = [];
          taxCalculations = [];
          estatePlans = [plan];
          alertPrefs = null;
        };
      };
      case (?data) {
        {
          leverageScenarios = data.leverageScenarios;
          taxCalculations = data.taxCalculations;
          estatePlans = data.estatePlans.concat([plan]);
          alertPrefs = data.alertPrefs;
        };
      };
    };
    users.add(caller, userData);
  };

  public query ({ caller }) func getEstatePlans() : async [EstatePlan] {
    switch (users.get(caller)) {
      case (null) { [] };
      case (?data) { data.estatePlans };
    };
  };

  public shared ({ caller }) func setAlertPrefs(prefs : AlertPrefs) : async () {
    let userData = switch (users.get(caller)) {
      case (null) {
        {
          leverageScenarios = [];
          taxCalculations = [];
          estatePlans = [];
          alertPrefs = ?prefs;
        };
      };
      case (?data) {
        {
          leverageScenarios = data.leverageScenarios;
          taxCalculations = data.taxCalculations;
          estatePlans = data.estatePlans;
          alertPrefs = ?prefs;
        };
      };
    };
    users.add(caller, userData);
  };

  public query ({ caller }) func getAlertPrefs() : async ?AlertPrefs {
    switch (users.get(caller)) {
      case (null) { null };
      case (?data) { data.alertPrefs };
    };
  };

  public query ({ caller }) func getUserData() : async ?UserData {
    users.get(caller);
  };

  public shared ({ caller }) func calculateLeverageMetrics(borrowAmount : Float, borrowRate : Float, targetYield : Float, ltvRatio : Float) : async {
    netSpread : Float;
    effectiveReturn : Float;
    riskScore : Float;
    marginCallTrigger : Float;
    verdict : Text;
  } {
    let netSpread = targetYield - borrowRate;
    let effectiveReturn = 1.0 + (netSpread * ltvRatio);
    let riskScore = if (ltvRatio > 0.7 or borrowRate > 10.0) {
      8.0;
    } else { 3.0 };

    let marginCallTrigger = if (ltvRatio > 0) {
      1.0 - ltvRatio;
    } else { 1.0 };

    let verdict = if (riskScore <= 3.0) {
      "Smart";
    } else if (riskScore <= 7.0) {
      "Caution";
    } else { "Dangerous" };

    {
      netSpread;
      effectiveReturn;
      riskScore;
      marginCallTrigger;
      verdict;
    };
  };
};
