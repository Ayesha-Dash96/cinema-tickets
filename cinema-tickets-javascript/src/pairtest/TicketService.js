import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from './thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from './thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  static TICKET_PRICES = {INFANT : 0, CHILD : 15, ADULT : 25};

  constructor() {
    this.ticketTypeRequests = new TicketPaymentService();
    this.SeatReservationService = new SeatReservationService();
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // logic is adult ticket -25 pounds, child ticket 15 pounds and infact ticket 0 pounds
    // child ticket and infant ticket cannot be bought without adult ticket
    //only child and adult will have seats
    // a maximum of 25 tickets can be bought by a single customer
    

  }

  #validatePurchase(ticketTypeRequests) {

  }

  #totalPrice(ticketTypeRequests) {

    let totalCost = 0;

    for(let req of ticketTypeRequests) {
      const ticketCost = TicketService.TICKET_PRICES[req.getTicketType()];
      totalCost += ticketCost*req.getNoOfTickets();
    }
    
    return totalCost;
  }
}
