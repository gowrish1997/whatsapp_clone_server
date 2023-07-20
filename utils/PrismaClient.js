let prismaInstance=null;
import { PrismaClient } from "@prisma/client";
function getPrismaInstance(){
    if(!prismaInstance){
        prismaInstance=new PrismaClient();
    }
    return prismaInstance;
}
export default getPrismaInstance