
function getTokenFromHeader(req){
    const accessToken =  req.cookies["accessToken"]
    if(accessToken){
        return accessToken
    }
    return null
}


module.exports=getTokenFromHeader