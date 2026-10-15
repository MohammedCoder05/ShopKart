import jwt from 'jsonwebtoken'
function genToken(customerId){
   const token =  jwt.sign({customerId},process.env.jwt_secret)
   return token;
}
export default genToken