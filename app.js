(function () {

  var closedTicketWithFollowup = {},
      completedAuditRequests = 0; 
      // increment the value by 1 for every time an AJAX request is sent to closed ticket ID URL
    // There will only be an AJAX request for a closed ticket...
    // ...once all AJAX requests are complete = the counter will be the same as total closed tickets value.

  return {

    requests: {

      getAuditWithSideLoadTicket: function(id) {
        return {
          url: '/api/v2/tickets/' + id + '/audits.json?include=tickets',
          type: 'GET'
        };
      },

      getClosedTickets: function(next_page) {
        return {
          url: next_page || '/api/v2/search.json?query=status:closed',
          type: 'GET'
        };
      }

    },

    events: {

      // Lifecycle Events
      'app.created': 'init',
      
      // AJAX Events & Callbacks
      'getClosedTickets.done':'getClosedTicketsDone',
      'getClosedTickets.fail':'getClosedTicketsFail',

      'getAuditWithSideLoadTicket.done': 'getAuditWithSideLoadTicketDone',
      'getAuditWithSideLoadTicket.fail': 'getAuditWithSideLoadTicketFail',
      
      // DOM Events
      'click .search': 'fetch', // get all closed tickets
      'click .go_back': function(){
        this.switchTo('main');
      },
      'click .get_follow_ups': function(){
        this.getFollowUps(this.filteredTickets); // Pass filtered results of all closed ticket IDs to the getFollowUps function for handling
      }

    },

    init: function () {
      this.switchTo('main');
      console.log(closedTicketWithFollowup);
      console.log(completedAuditRequests);
      console.log('picture me gone');
    },

    fetch: function() {
      this.filteredTickets = []; // results of search
      this.ajax('getClosedTickets');
      this.switchTo('loading');
    },

    getClosedTicketsFail: function(response) {
      services.notify('FAIL');
      console.log(response);
    },

    // Get all suspended tickets, filter for IDs w cause matching any app settings cause that's true
    getClosedTicketsDone: function(data) {

      var next_page         = data.next_page,
          previous_page     = data.previous_page,
          finalTicketCount  = data.count,
          filteredTickets   = [];

      // Keep sending AJAX requests until all pages of results obtained
      if( next_page ) {

        console.log('greater than 100 results - 2+ pages - next request: ');
        console.log(next_page);
        this.filteredTickets = this.filteredTickets.concat(data.results);
        this.ajax('getClosedTickets', next_page);

      // Execute this code block if account has LESS THAN 101 suspended tickets
      } else if ( !previous_page && !next_page ) {
        
        console.log('all results retrieved - 1 page only - no more requests required');
        
        // build array of ticket IDs:
        this.results = data.results;
        console.log('results:');
        console.log(this.results);
        console.log('filtered results / closed ticket ids: ');

        for (var i = 0; this.results.length > i; i++) {
          filteredTickets.push(this.results[i].id);
        }

        console.log('There are ' + filteredTickets.length + ' closed tickets');
        console.log(filteredTickets);
        
        // No closed tickets
        if (filteredTickets.length > 0) {
          this.switchTo('noTickets');
        }

        this.switchTo('done', {
          filteredTickets: filteredTickets.length
        });

        console.log('saved filteredTickets to root of app');
        this.filteredTickets = filteredTickets;
        console.log('click the \'Get the Follow Ups\' button in the app');

      // Execute this code block once FINAL page of paginated results retrieved
      } else {

        console.log('all results retrieved - 2+ pages - no more requests required');

        // build array of ticket IDs:
        this.filteredTickets = this.filteredTickets.concat(data.results);
        this.results = this.filteredTickets;
        var results = this.results;
        console.log('results:');
        console.log(results);
        console.log('filtered results / closed ticket ids: ');

        for (var j = 0; this.results.length > j; j++) {
          filteredTickets.push(this.results[j].id);
        }

        console.log('There are ' + filteredTickets.length + ' closed tickets');
        console.log(filteredTickets);

        this.switchTo('done', {
          filteredTickets: filteredTickets.length
        });

        console.log('saved filteredTickets to root of app');
        this.filteredTickets = filteredTickets;
        console.log('click the \'Get the Follow Ups\' button in the app');

      }
    
    },


    getAuditWithSideLoadTicketDone: function(data) {

      this.switchTo('loading2');

      var next_page         = data.next_page,
          previous_page     = data.previous_page;

      console.log('getAuditWithSideLoadTicketDone');
      console.log('data');
      console.log(data);

      completedAuditRequests++;
      console.log(completedAuditRequests); 
      // this is the counter - when this value reaches the total queued then switch to done2.hdbs

      if (!next_page) {

        if (data.tickets.length < 2) {
          if (data.tickets[0].followup_ids.length !== undefined ) {
            console.log('not undefined');
            
            if (data.tickets[0].followup_ids.length > 0) {
              console.log('has followups');
              var followUpIds = [];

              for (var i = 0; data.tickets[0].followup_ids.length > i; i++) {
                followUpIds.push(data.tickets[0].followup_ids[i]);
              }

              // There are follow ups!
              console.log('^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*');
              console.log('followUpIds for ticket ' + data.audits[0].ticket_id + ':');
              console.log(followUpIds);
              console.log('^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*');

              // You can create an object where the key is the closed ticket id & the value is an array of all the follow ups.

              console.log('closed ticket ID: ' + data.audits[0].ticket_id + ' with follow up ID(s): ' + followUpIds);

              var closed = data.audits[0].ticket_id;
              // this.closedTicketWithFollowup[closed] = [followUpIds]; // this is failing without a discernible pattern


              // START BACK HERE
              // var testObject[closed] = { closed.val() ,[followUpIds] };
              // console.log('testObject:******************************');
              // console.log(testObject);

            } else {
              console.log(data.tickets[0].followup_ids.length);
            }
          }
        } else {
          console.log(data.audits[0].ticket_id + ' has no follow up tickets');
        }

      } else {
        console.log('there is a next_page: ');
        console.log(next_page);
      }
      
      console.log(completedAuditRequests);
      console.log(this.totalRequests);

      console.log('^^^^^^^   closedTicketWithFollowup   ^^^^^^^^ ');
      console.log(closedTicketWithFollowup);

      this.switchTo('loading2');

        if (completedAuditRequests === this.totalRequests) {
          this.switchTo('done2');
          console.log('All AJAX requests to the ~/audits/{id}.json COMPLETE');
        }

      console.log('@@@@@@@@@@@@@@@@@@@@@ single ajax request to audits done @@@@@@@@@@@@@@@@@@@@@');

    },


    getAuditWithSideLoadTicketFail: function() {
      services.notify('getAuditWithSideLoadTicketFail', 'error');
    },

    // This function handles the IDs sending AJAX request for every single closed ticket IDs...
    // ...we don't yet know if any of the closed tickets have follow ups...
    // ...results of each AJAX request will yield that information.
    getFollowUps: function() {

      var filteredTickets = this.filteredTickets;
      console.log('start \'getFollowUps\'');
      console.log('## |start| for loop to ticket audits for each closed ticket id ##');

      var totalRequests = filteredTickets.length;
      this.totalRequests = totalRequests; // the number of closed tickets you will send AJAX requests for

      for (var i = 0; filteredTickets.length > i; i++) {
        var id = filteredTickets[i];
        console.log(id);
        this.ajax('getAuditWithSideLoadTicket', id);
        console.log('Sending ID: ' + filteredTickets[i]);
      }

      console.log('## |end| for loop to ticket audits for each closed ticket id ##');

    }

  };

}());