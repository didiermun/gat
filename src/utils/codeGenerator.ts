
//generate a code that has characters and numbers [made of ten elements]
export function generateCode(){
    let code = "";
    let alphaPossible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numericPossible = "0123456789";

    for(var i = 0; i < 3; i++){
        code += alphaPossible.charAt(Math.floor(Math.random() * alphaPossible.length))
    }

    for(var i = 0; i < 5; i++){
        code += numericPossible.charAt(Math.floor(Math.random() * numericPossible.length))
    }

    for(var i = 0; i < 2; i++){
        code += alphaPossible.charAt(Math.floor(Math.random() * alphaPossible.length))
    }

    return code;
}