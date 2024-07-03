export function validatePassword(password: string) {
    if (password.length < 8)
        return false;

    const numStr =  /\d/ 
    if(!numStr.test(password)) {
        console.error("password not contains number");
        return false;
    }
    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(!format.test(password)) {
        console.error("password not contains special characters");
        return false;
    }
    return true;
}

export function validateEmail(email: string) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
  