import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import logger from '../../utils/logger.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  constructor() {
    this.ticketPaymentService = new TicketPaymentService();
    this.seatReservationService = new SeatReservationService();
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
 
    try {

      logger.info('Started the ticket purchasing process');

      this.#validateAccountID(accountID);
      logger.info('Account ID is valid');

      this.#validatePurchase(ticketTypeRequests);
      logger.info('Validation completed');

      const total_Price = this.#totalPrice(ticketTypeRequests);
      const total_Seats = this.#totalSeats(ticketTypeRequests);
      logger.info(`Calculated total price £${total_Price} & total seats ${total_Seats}`);

      this.ticketPaymentService.makePayment(accountId, total_Price);
      logger.info('Service request made to TicketPaymentService.gs');
      this.seatReservationService.reserveSeat(accountId, total_Seats);
      logger.info('Service request made to SeatReservationService.gs');

      logger.info('Tickets purchased and seat reservation successful');


    } catch (error){
      logger.info('Purchase unsuccessful');

      if( error instanceof InvalidPurchaseException) {
        return  `error message : ${error.message}`;
      } 
      else {
        return `Unexpected error encountered : ${error.message}`;
      }
    }

  } 


  //validates account ID 
  #validateAccountID(accountID) {
    if( accountID <= 0) {
      throw new InvalidPurchaseException('AccountID must be greater than 0');
    }
  }

  // validates all the business rules
  #validatePurchase(ticketTypeRequests) {

    let noOfAdults = 0;
    let totalTickets = 0;


    for(const req of ticketTypeRequests){
      const ticketType = req.getTicketType();
      const noOfTickets = req.getNoOfTickets();

      if(noOfTickets < 0) {
        throw new InvalidPurchaseException('The number of tickets must not be negative');
      }

      if(ticketType === 'ADULT'){
        noOfAdults += noOfTickets;

      }
      totalTickets += noOfTickets;
    }

    if(noOfAdults === 0) {
      throw new InvalidPurchaseException('Child ticket and/or infant ticket cannot be purchased without Adult ticket');
    }

    if(totalTickets > 25) {
      throw new InvalidPurchaseException('A maximum of 25 tickets can be purchased at once');
    }

  }

  // calculates the total seats
  #totalSeats(ticketTypeRequests) {

    let totalSeats = 0;
    for(let req of ticketTypeRequests) {
      if(req.getTicketType !== 'INFANT') {
        totalSeats += req.getNoOfTickets();
      }
    }
    return totalSeats;
  }
  //calculates the total price of tickets
  #totalPrice(ticketTypeRequests) {

    let totalCost = 0;
    const prices = {INFANT : 0, CHILD : 15, ADULT : 25};

    for(let req of ticketTypeRequests) {
      const ticketCost = prices[req.getTicketType()];
      totalCost += ticketCost*req.getNoOfTickets();
    }
    
    return totalCost;
  }
}
