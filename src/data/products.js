// Currency formatter — BDT. (Product data now comes from the backend API.)
export const fmtBDT = (n) => '৳ ' + Number(n || 0).toLocaleString('en-BD')
