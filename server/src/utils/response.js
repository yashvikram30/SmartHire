// standard response 

class response {
    constructor(success=false ,message=null, data=null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}


export default response ;