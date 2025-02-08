export default class InvalidPurchaseException extends Error {

    constructor(message) {
        supper(message);
        this.name = "InvalidPurchaseException";
    }
}
