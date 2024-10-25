// HTML element ID List
// ==============================================================
const VIEW_BASICINFO_MALE = "eid_male";
const VIEW_BASICINFO_FEMALE = "eid_female";
const VIEW_BASICINFO_HEIGHT = "eid_height";
const VIEW_BASICINFO_WEIGHT = "eid_weight";
const VIEW_BASICINFO_BIRTH = "eid_birth";
const VIEW_BASICINFO_HT_NORMAL = "eid_ht_normal";
const VIEW_BASICINFO_HT_PREHYPERTENSION = "eid_ht_prehypertension";
const VIEW_BASICINFO_HT_HYPERTENSION = "eid_ht_hypertension";
const VIEW_CAMERA_FRONT = "eid_camera_front";
const VIEW_CAMERA_BACK = "eid_camera_back";
const VIEW_BASICINFO_BTN_NEXT = "eid_btn_next";
// ==============================================================


// Basic Info Page
// ==============================================================
let _info_map_value_dict = {
  [VIEW_BASICINFO_MALE]: 1,
  [VIEW_BASICINFO_FEMALE]: 0,
  [VIEW_BASICINFO_HT_NORMAL]: "normal",
  [VIEW_BASICINFO_HT_PREHYPERTENSION]: "prehypertension",
  [VIEW_BASICINFO_HT_HYPERTENSION]: "hypertension",
  [VIEW_CAMERA_FRONT]: "user",
  [VIEW_CAMERA_BACK]: "environment",
};

const CheckedUpdate = (self_id, others_id) => {
   if (document.getElementById(self_id).checked) {
    others_id.forEach((element) => {
      if (element != self_id) document.getElementById(element).checked = false;
    });
  } else {
    document.getElementById(others_id).checked = true;
  }
};

const GetSex = () => {
  let sex = null;

  if (document.getElementById(VIEW_BASICINFO_MALE).checked) {
    sex = _info_map_value_dict[VIEW_BASICINFO_MALE];
  } else if (document.getElementById(VIEW_BASICINFO_FEMALE).checked) {
    sex = _info_map_value_dict[VIEW_BASICINFO_FEMALE];
  }
  return sex;
};

const GetHeight = () => {
  return parseInt(document.getElementById(VIEW_BASICINFO_HEIGHT).value, 10);
};

const GetWeight = () => {
  return parseInt(document.getElementById(VIEW_BASICINFO_WEIGHT).value, 10);
};

const GetBirthYear = () => {
  return parseInt(document.getElementById(VIEW_BASICINFO_BIRTH).value, 10);
};

const GetHT = () => {
  let ht = null;
  
  if (document.getElementById(VIEW_BASICINFO_HT_NORMAL).checked) {
    ht = _info_map_value_dict[VIEW_BASICINFO_HT_NORMAL];
  } else if (document.getElementById(VIEW_BASICINFO_HT_PREHYPERTENSION).checked) {
    ht = _info_map_value_dict[VIEW_BASICINFO_HT_PREHYPERTENSION];
  } else if (document.getElementById(VIEW_BASICINFO_HT_HYPERTENSION).checked) {
    ht = _info_map_value_dict[VIEW_BASICINFO_HT_HYPERTENSION];
  }
  return ht;
};

const GetCameraFacingMode = () => {
  let facing_mode = null;
  
  if (document.getElementById(VIEW_CAMERA_FRONT).checked) {
    facing_mode = _info_map_value_dict[VIEW_CAMERA_FRONT];
  } else if (document.getElementById(VIEW_CAMERA_BACK).checked) {
    facing_mode = _info_map_value_dict[VIEW_CAMERA_BACK];
  }
  return facing_mode;
};

const GoToNext = () => {
  console.log("GoToNext() called");
  let sex = GetSex();
  let height = GetHeight();
  let weight = GetWeight();
  let birth_year = GetBirthYear();
  let ht = GetHT();
  let facing_mode = GetCameraFacingMode();

  if (isNaN(height) || isNaN(weight) || isNaN(birth_year)) {
    alert("Pelease input the basic information!");
  } else {
    let data = JSON.stringify({
      height: height,
      weight: weight,
      sex: sex,
      age: new Date().getFullYear() - birth_year,
      bp_mode: "ternary",
      bp_group: ht,
      facing_mode: facing_mode,
    });
    console.log(data);

    sessionStorage.setItem("data", data);

    window.location.href = "scan.html"
  }
};

const InitBasicInfo = () => {
  console.log("InitBasicInfo() called");
  // Set the group & clicked event of the checkboxes.
  document.getElementById(VIEW_BASICINFO_MALE).onclick = () => { CheckedUpdate(VIEW_BASICINFO_MALE, [VIEW_BASICINFO_FEMALE]) }
  document.getElementById(VIEW_BASICINFO_FEMALE).onclick = () => { CheckedUpdate(VIEW_BASICINFO_FEMALE, [VIEW_BASICINFO_MALE]) }
  document.getElementById(VIEW_BASICINFO_HT_NORMAL).onclick = () => CheckedUpdate(VIEW_BASICINFO_HT_NORMAL, [VIEW_BASICINFO_HT_PREHYPERTENSION, VIEW_BASICINFO_HT_HYPERTENSION])
  document.getElementById(VIEW_BASICINFO_HT_PREHYPERTENSION).onclick = () => CheckedUpdate(VIEW_BASICINFO_HT_PREHYPERTENSION, [VIEW_BASICINFO_HT_NORMAL, VIEW_BASICINFO_HT_HYPERTENSION])
  document.getElementById(VIEW_BASICINFO_HT_HYPERTENSION).onclick = () => CheckedUpdate(VIEW_BASICINFO_HT_HYPERTENSION, [VIEW_BASICINFO_HT_NORMAL, VIEW_BASICINFO_HT_PREHYPERTENSION])
  document.getElementById(VIEW_CAMERA_FRONT).onclick = () => { CheckedUpdate(VIEW_CAMERA_FRONT, [VIEW_CAMERA_BACK]) }
  document.getElementById(VIEW_CAMERA_BACK).onclick = () => { CheckedUpdate(VIEW_CAMERA_BACK, [VIEW_CAMERA_FRONT]) }

  // Set the clicked event of the next button.
  document.getElementById(VIEW_BASICINFO_BTN_NEXT).onclick = () => GoToNext();
};
// ==============================================================

document.addEventListener("DOMContentLoaded", () => {
  InitBasicInfo();
});
