function getTokenFromHeader(req){
    const authHeader =  req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if(parts.length===2 && /^Bearer$/i.test(parts[0])){
        return parts[1]
    }
    if (parts.length === 1) return parts[0];

  return null;
}


module.exports=getTokenFromHeader