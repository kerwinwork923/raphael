class VitalResultPrinter {
  static STRESS_INDEX_NONE = "si_none";
  static STRESS_INDEX_LOW = "si_low";
  static STRESS_INDEX_NORMAL = "si_normal";
  static STRESS_INDEX_MILD = "si_mild";
  static STRESS_INDEX_HIGH = "si_high";
  static STRESS_INDEX_VERY_HIGH = "si_very_high";

  constructor() {
    this._hr_element = null;
    this._hrv_element = null;
    this._bioage_element = null;
    this._ba2_element = null;
    this._ba4_element = null;
    this._sbp_element = null;
    this._dbp_element = null;
    this._rr_element = null;
    this._spo2_element = null;
    this._si_name_element = null;
    this._ans_index_sns_element = null;
    this._ans_index_pns_element = null;
    this._wellness_element = null;
    this._hba1c_element = null;
    this._hba1c_risk_element = null;
    this._hba1c_range_element = null;
    this._hemoglobin_element = null;
    this._cholesterol_element = null;
    this._cholesterol_risk_element = null;
    this._cholesterol_range_element = null;

    this._last_hr = -1;
    this._last_hrv = -1;
    this._last_bioage = -1;
    this._last_ba2 = -1;
    this._last_ba4 = -1;
    this._last_sbp = -1;
    this._last_dbp = -1;
    this._last_rr = -1;
    this._last_spo2 = -1;
    this._last_si = -1;
    this._last_ans_index_sns = -1;
    this._last_ans_index_pns = -1;
    this._last_wellness = -1;
    this._last_hba1c = -1;
    this._last_hba1c_risk = -1;
    this._last_hba1c_range = [];
    this._last_hemoglobin = -1;
    this._last_cholesterol = -1;
    this._last_cholesterol_risk = -1;
    this._last_cholesterol_range = "";
  }

  setDefaultElement({ hr_id, hrv_id, sbp_id, dbp_id, rr_id, spo2_id, si_id, bioage_id,ba2_id,ba4_id }) {
    if (typeof hr_id === "string") {
      this._hr_element = document.getElementById(hr_id);
    }
    if (typeof hrv_id === "string") {
      this._hrv_element = document.getElementById(hrv_id);
    }
    if (typeof sbp_id === "string") {
      this._sbp_element = document.getElementById(sbp_id);
    }
    if (typeof dbp_id === "string") {
      this._dbp_element = document.getElementById(dbp_id);
    }
    if (typeof rr_id === "string") {
      this._rr_element = document.getElementById(rr_id);
    }
    if (typeof spo2_id === "string") {
      this._spo2_element = document.getElementById(spo2_id);
    }
    if (typeof si_id === "string") {
      this._si_name_element = document.getElementById(si_id);
    }
   
    if (typeof bioage_id === "string") {
      this._bioage_element = document.getElementById(bioage_id);
    }
    if (typeof ba2_id === "string") {
      this._ba2_element = document.getElementById(ba2_id);
    }
    if (typeof ba4_id === "string") {
      this._ba4_element = document.getElementById(ba4_id);
    }
    this._last_hr = -1;
    this._last_hrv = -1;
    this._last_bioage = -1;
    this._last_ba2 = -1;
    this._last_ba4 = -1;
    this._last_sbp = -1;
    this._last_dbp = -1;
    this._last_rr = -1;
    this._last_spo2 = -1;
    this._last_si = -1;
    
  }

  setAnsIndexElement({ ans_index_sns_id, ans_index_pns_id }) {
    if (typeof ans_index_sns_id === "string") {
      this._ans_index_sns_element = document.getElementById(ans_index_sns_id);
    }
    if (typeof ans_index_pns_id === "string") {
      this._ans_index_pns_element = document.getElementById(ans_index_pns_id);
    }
    this._last_ans_index_sns = -1;
    this._last_ans_index_pns = -1;
  }

  setWellnessElement({ wellness_id }) {
    if (typeof wellness_id === "string") {
      this._wellness_element = document.getElementById(wellness_id);
    }
    this._last_wellness = -1;
  }

  setHbA1cElement({ hba1c_id, hba1c_risk_id, hba1c_range_id }) {
    if (typeof hba1c_id === "string") {
      this._hba1c_element = document.getElementById(hba1c_id);
    }
    if (typeof hba1c_risk_id === "string") {
      this._hba1c_risk_element = document.getElementById(hba1c_risk_id);
    }
    if (typeof hba1c_range_id === "string") {
      this._hba1c_range_element = document.getElementById(hba1c_range_id);
    }
    this._last_hba1c = -1;
    this._last_hba1c_risk = -1;
    this._last_hba1c_range = [];
  }

  setHemoglobinElement({ hemoglobin_id }) {
    if (typeof hemoglobin_id === "string") {
      this._hemoglobin_element = document.getElementById(hemoglobin_id);
    }
    this._last_hemoglobin = -1;
  }

  setCholesterolElement({ cholesterol_id, cholesterol_risk_id, cholesterol_range_id }) {
    if (typeof cholesterol_id === "string") {
      this._cholesterol_element = document.getElementById(cholesterol_id);
    }
    if (typeof cholesterol_risk_id === "string") {
      this._cholesterol_risk_element = document.getElementById(cholesterol_risk_id);
    }
    if (typeof cholesterol_range_id === "string") {
      this._cholesterol_range_element = document.getElementById(cholesterol_range_id);
    }
    this._last_cholesterol = -1;
    this._last_cholesterol_risk = -1;
    this._last_cholesterol_range = "";
  }

  reset() {
    let default_value = "--";

    this._setValidColor(this._hr_element, true);
    this._setValidColor(this._sbp_element, true);
    this._setValidColor(this._dbp_element, true);
    this._setValidColor(this._rr_element, true);
    this._setValidColor(this._spo2_element, true);

    this._setValue(this._hr_element, default_value);
    this._setValue(this._hrv_element, default_value);
    this._setValue(this._bioage_element, default_value);
    this._setValue(this._ba2_element, default_value);
    this._setValue(this._ba4_element, default_value);
    this._setValue(this._sbp_element, default_value);
    this._setValue(this._dbp_element, "/" + default_value);
    this._setValue(this._rr_element, default_value);
    this._setValue(this._spo2_element, default_value);
    this._setValue(this._si_name_element, default_value);
    this._setValue(this._ans_index_sns_element, default_value);
    this._setValue(this._ans_index_pns_element, default_value);
    this._setValue(this._wellness_element, default_value);
    this._setValue(this._hba1c_element, default_value);
    this._setValue(this._hba1c_risk_element, default_value);
    this._setValue(this._hba1c_range_element, default_value);
    this._setValue(this._hemoglobin_element, default_value);
    this._setValue(this._cholesterol_element, default_value);
    this._setValue(this._cholesterol_risk_element, default_value);
    this._setValue(this._cholesterol_range_element, default_value);

    this._last_hr = -1;
    this._last_hrv = -1;
    this._last_bioage = -1;
    this._last_ba2 = -1;
    this._last_ba4 = -1;
    this._last_sbp = -1;
    this._last_dbp = -1;
    this._last_rr = -1;
    this._last_spo2 = -1;
    this._last_si = -1;
    this._last_ans_index_sns = -1;
    this._last_ans_index_pns = -1;
    this._last_wellness = -1;
    this._last_hba1c = -1;
    this._last_hba1c_risk = -1;
    this._last_hba1c_range = [];
    this._last_hemoglobin = -1;
    this._last_cholesterol = -1;
    this._last_cholesterol_risk = -1;
    this._last_cholesterol_range = "";
  }

  update({ hr, hrv, sbp, dbp, rr, spo2, si, ans_index_sns, ans_index_pns, wellness, hba1c, hba1c_risk, hba1c_range, hemoglobin, cholesterol, cholesterol_risk, cholesterol_range, hr_valid, bp_valid, rr_valid, spo2_valid, bioage, ba2, ba4}) {
    this._updateHR(hr, hr_valid);
    this._updateHRV(hrv);
    //this._updateBIOAGE(hrv);
    //this._updateBA2(hr,hrv);
    //this._updateBA4(hr,hrv,sbp,dbp);
    this._updateBIOAGE(bioage);
    this._updateBA2(ba2);
    this._updateBA4(ba4);
    this._updateBP(sbp, dbp, bp_valid);
    this._updateRR(rr, rr_valid);
    this._updateSpO2(spo2, spo2_valid);
    this._updateStressIndex(si);
    this._updateANSIndexSNS(ans_index_sns);
    this._updateANSIndexPNS(ans_index_pns);
    this._updateWellness(wellness);
    this._updateHbA1c(hba1c);
    this._updateHbA1cRisk(hba1c_risk);
    this._updateHbA1cRange(hba1c_range);
    this._updateHemoglobin(hemoglobin);
    this._updateCholesterol(cholesterol);
    this._updateCholesterolRisk(cholesterol_risk);
    this._updateCholesterolRange(cholesterol_range);
  }

  _setValue(element, value) {
    if (element != null) {
      element.innerHTML = (value);
    }
  }

  _updateHR(hr, hr_valid) {
    if (typeof hr === "number" && hr > 0 && this._last_hr != hr) {
      this._last_hr = hr;
      this._setValue(this._hr_element, Math.round(hr));
      this._setValidColor(this._hr_element, hr_valid);
    }
  }

  _updateHRV(hrv) {
    if (typeof hrv === "number" && hrv > 0 && this._last_hrv != hrv) {
      this._last_hrv = hrv;
      this._setValue(this._hrv_element, Math.round(hrv));
    }
  }
  /*_updateBIOAGE(hrv_indices) {
    if (typeof hrv === "number" && hrv> 0 && this._last_hrv != hrv) {
      this._last_hrv = hrv;
      this._setValue(this._bioage_element, Math.round((hrv-53.907)/-0.502));
    }
  }
  _updateBA2(hr,hrv) {
    if (typeof hrv === "number" && hrv > 0 && this._last_hrv != hrv) {
      this._last_hrv = hrv;
      this._setValue(this._ba2_element, Math.round((29.740-0.204*hrv-0.154*hr)*5));
    }
  }
  _updateBA4(hr,hrv,sbp,dbp) {
    if (typeof hrv === "number" && hrv > 0 && this._last_hrv != hrv) {
      this._last_hrv = hrv;
      this._setValue(this._ba4_element, Math.round((28.553-0.201*hrv-0.152*hr+0.012*sbp-0.006*dbp)*5));
    }
  }*/
  _updateBIOAGE(bioage) {
    if (typeof bioage === "number" && bioage> 0 && this._last_bioage != bioage) {
      this._last_bioage = bioage;
      this._setValue(this._bioage_element, Math.round(bioage));
    }
  }
  _updateBA2(ba2) {
    if (typeof ba2 === "number" && ba2 > 0 && this._last_ba2 != ba2) {
      this._last_ba2 = ba2;
      this._setValue(this._ba2_element, Math.round(ba2));
    }
  }
  _updateBA4(ba4) {
    if (typeof ba4 === "number" && ba4 > 0 && this._last_ba4 != ba4) {
      this._last_ba4 = ba4;
      this._setValue(this._ba4_element, Math.round(ba4));
    }
  }




  _updateBP(sbp, dbp, bp_valid) {
    let to_update = false;
    if (typeof sbp === "number" && sbp > 0 && this._last_sbp != sbp) {
      this._last_sbp = sbp;
      this._setValue(this._sbp_element, Math.round(sbp));
      to_update = true;
    }
    if (typeof dbp === "number" && dbp > 0 && this._last_dbp != dbp) {
      this._last_dbp = dbp;
      this._setValue(this._dbp_element, `/${Math.round(dbp)}`);
      to_update = true;
    }
    if (to_update) {
      this._setValidColor(this._dbp_element, bp_valid);
      this._setValidColor(this._sbp_element, bp_valid);
    }
  }

  _updateRR(rr, rr_valid) {
    if (typeof rr === "number" && rr > 0 && this._last_rr != rr) {
      this._last_rr = rr;
      this._setValue(this._rr_element, Math.round(rr));
      this._setValidColor(this._rr_element, rr_valid);
    }
  }

  _updateSpO2(spo2, spo2_valid) {
    if (typeof spo2 === "number" && spo2 > 0 && this._last_spo2 != spo2) {
      this._last_spo2 = spo2;
      this._setValue(this._spo2_element, Math.round(spo2));
      this._setValidColor(this._spo2_element, spo2_valid);
    }
  }

  _updateStressIndex(si) {
    if (this._si_name_element != null && typeof si === "number" && si != null && this._last_si != si) {
      this._last_si = si;
      if (si < 0) {
        this._si_name_element.innerHTML = "---";
      } else if (si < 50) {
        this._si_name_element.innerHTML = "低";
      } else if (si < 200) {
        this._si_name_element.innerHTML = "正常";
      } else if (si < 350) {
        this._si_name_element.innerHTML = "中";
      } else if (si < 500) {
        this._si_name_element.innerHTML = "高";
      } else {
        this._si_name_element.innerHTML = "非常高";
      }
    }
  }

  _updateANSIndexSNS(ans_index_sns) {
    if (typeof ans_index_sns === "number" && this._last_ans_index_sns != ans_index_sns) {
      this._last_ans_index_sns = ans_index_sns;
      this._setValue(this._ans_index_sns_element, ans_index_sns);
    }
  }

  _updateANSIndexPNS(ans_index_pns) {
    if (typeof ans_index_pns === "number" && ans_index_pns > 0 && this._last_ans_index_pns != ans_index_pns) {
      this._last_ans_index_pns = ans_index_pns;
      this._setValue(this._ans_index_pns_element, ans_index_pns);
    }
  }

  _updateWellness(wellness) {
    if (typeof wellness === "number" && wellness > 0 && this._last_wellness != wellness) {
      this._last_wellness = wellness;
      this._setValue(this._wellness_element, wellness);
    }
  }

  _updateHbA1c(hba1c) {
    if (typeof hba1c === "number" && hba1c > 0 && this._last_hba1c != hba1c) {
      this._last_hba1c = hba1c;
      this._setValue(this._hba1c_element, hba1c);
    }
  }

  _updateHbA1cRisk(hba1c_risk) {
    if (typeof hba1c_risk === "number" && hba1c_risk >= 0 && this._last_hba1c_risk != hba1c_risk) {
      this._last_hba1c_risk = hba1c_risk;
      this._setValue(this._hba1c_risk_element, hba1c_risk);
    }
  }

  _updateHbA1cRange(hba1c_range) {
    if (Array.isArray(hba1c_range) && hba1c_range.length == 2) {
      this._last_hba1c_range = hba1c_range;
      this._setValue(this._hba1c_range_element, `${hba1c_range[0]}-${hba1c_range[1]}`);
    }
  }

  _updateHemoglobin(hemoglobin) {
    if (typeof hemoglobin === "number" && hemoglobin > 0 && this._last_hemoglobin != hemoglobin) {
      this._last_hemoglobin = hemoglobin;
      this._setValue(this._hemoglobin_element, hemoglobin);
    }
  }

  _updateCholesterol(cholesterol) {
    if (typeof cholesterol === "number" && cholesterol > 0 && this._last_cholesterol != cholesterol) {
      this._last_cholesterol = cholesterol;
      this._setValue(this._cholesterol_element, cholesterol);
    }
  }

  _updateCholesterolRisk(cholesterol_risk) {
    if (typeof cholesterol_risk === "number" && cholesterol_risk >= 0 && this._last_cholesterol_risk != cholesterol_risk) {
      this._last_cholesterol_risk = cholesterol_risk;
      this._setValue(this._cholesterol_risk_element, cholesterol_risk);
    }
  }

  _updateCholesterolRange(cholesterol_range) {
    if (this._cholesterol_range_element != null && typeof cholesterol_range === "string" && cholesterol_range != "" && this._last_cholesterol_range != cholesterol_range) {
      this._last_cholesterol_range = cholesterol_range;
      if (cholesterol_range === "CHOLESTEROL_NORMAL") {
        this._cholesterol_range_element.innerHTML = "Normal";
      } else if (cholesterol_range === "CHOLESTEROL_BORDERLINE") {
        this._cholesterol_range_element.innerHTML = "BorderlineHigh";
      } else if (cholesterol_range === "CHOLESTEROL_HIGH") {
        this._cholesterol_range_element.innerHTML = "High";
      } else if (cholesterol_range === "CHOLESTEROL_INVALID") {
        this._cholesterol_range_element.innerHTML = "Invalid";
      }
    }
  }

  _setValidColor(element, toggle) {
    if (typeof toggle == "boolean" && toggle) {
      element.classList.add("text-success");
      element.classList.remove("text-dark");
    }
    else {
      element.classList.add("text-dark");
      element.classList.remove("text-success");
    }
  }
}
