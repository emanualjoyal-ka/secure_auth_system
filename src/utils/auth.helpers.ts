
//helper for getting first 2 octets of ip address for checking suspicious
export const getIPPrefix=(ip:string):string=>{
    if(!ip.includes(".")) return ip; // for ipv6, return it

    return ip.split(".").slice(0,2).join("."); // gets first 2 octets of ipv4
}

//NOT DONE YET FOR CHECKING IP AND DEVICE CHANGES, USE IN AUTH MIDDLEWARE