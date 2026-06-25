const show = (id, isShow = true) => {
  if (isShow)
    document.getElementById(id).style.visibility = "visible";
  else
    document.getElementById(id).style.visibility = "hidden";
}
const hide = (id) => {
  document.getElementById(id).style.visibility = "hidden";
}