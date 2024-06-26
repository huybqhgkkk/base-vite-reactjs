export const isEmpty = (value) => {
  return value === undefined || value === "" || value === null;
};

// validate số điện thoại VN
export const phoneVal = /^(^\+84|^84|^0)?[1|2|3|5|7|8|9]\d{8,9}$/;
export const phoneVal11 = /^(^\+84|^84|^0)?[1|2|3|5|7|8|9]\d{8,9}$/;
export const phoneVal10 = /^(^\+84|^84|^0)?[1|2|3|5|7|8|9]\d{8,8}$/;

//validate CMND/CCCD
export const idVal = /^[0-9]{9,12}$/;

//validate tên VN
export const nameVal =
/^[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềếềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý' ]+$/

export const regexNotSpecial =
  /^[a-zA-Z0-9.,\w\s-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý]*$/;

export const dateFormat = "DD/MM/YYYY";

export const YYYY_MM_DD = "YYYY-MM-DD";
export const DD_MM_YYYY = "DD/MM/YYYY";

export const identityCardVal =  /^([0-9]{12}|[0-9]{9})$/;;

export const emailVal =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
