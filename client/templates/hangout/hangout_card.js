<<<<<<< HEAD
Template.hangoutCard.onRendered(function(){
    $(function() {
        $('[data-toggle="popover"]').popover({ trigger: "hover", html: "true" }); 
    });
});
Template.hangoutCard.helpers({
  truncate: function(topic){
    return topic.truncate()
  },
  getDescriptionTruncated: function(description) {
    if(description.length && description.length > 400){
      return description.substring(0,400)+"...";
    }
    else {
      return description.substring(0,400)
    }
  }
});

Template.hangoutCard.events({
  'click .join-hangout': function() {
    console.log('clicked on join hangout')
      const data = {
        hangoutId: this._id,
        hostId: this.host.id,
      }
      Meteor.call('addUserToHangout', data, function(error, result) {
        if (result) {
          sweetAlert({
            title: TAPi18n.__("you_are_awesome"),
            text: TAPi18n.__("looking_forward_to_see_you"),
            confirmButtonText: TAPi18n.__("ok"),
            type: 'info'
          });
        }
      });
  },
  'click #leave-hangout': function() {
    if (this.host.id == Meteor.userId()) {
      sweetAlert({
        title: TAPi18n.__("remove_owner_from_hangout"),
        confirmButtonText: TAPi18n.__("ok"),
        type: 'warning'
      });
    } else {

      const data = {
        hangoutId: this._id,
        hostId: this.host.id,
      }

      Meteor.call('removeUserFromHangout', data, function(error, result) {
        if (result) console.log('removed');
      });
    }
  },
  'click .clone-hangout': function(e, hangout) {
    if (!Meteor.userId()) {
      sweetAlert({
        title: TAPi18n.__("login_create_hangout_title"),
        text: TAPi18n.__("login_create_hangout_message"),
        confirmButtonText: TAPi18n.__("sign_in_with_slack"),
        type: 'info'
      },
      function(){
        var options = {
          requestPermissions: ['identify', 'users:read']
        };
        Meteor.loginWithSlack(options);
      }
    );
    } else {
      //var start_time_reverted = moment(hangout.data.start).format('MM/DD/YYYY h:mm A');
      //var end_time_reverted = moment(hangout.data.end).format('MM/DD/YYYY h:mm A');

      console.log(hangout.data._id + ' this is a cloned hangout id');
      Session.set('hangoutId', hangout.data._id);

      Modal.show('cloneHangoutModal');
      $('#clone-hangout-modal #topic').val(hangout.data.topic);
      $('#clone-hangout-modal #description').val(hangout.data.description);
      $('#clone-hangout-modal input[value=' + hangout.data.type + ']').prop("checked", true);
      //$('#clone-hangout-modal #start-date-time').val(start_time_reverted);
      //$('#clone-hangout-modal #end-date-time').val(end_time_reverted);
      //console.log(start_time_reverted);
      //console.log(end_time_reverted);
    }
  },
  'click .report-hangout': function(e, hangout) {
    if (!Meteor.userId()) {
      sweetAlert({
        title: TAPi18n.__("login_create_hangout_title"),
        text: TAPi18n.__("login_create_hangout_message"),
        confirmButtonText: TAPi18n.__("sign_in_with_slack"),
        type: 'info'
      },
      function(){
        var options = {
          requestPermissions: ['identify', 'users:read']
        };
        Meteor.loginWithSlack(options);
      }
    );
    } else {

      Session.set('hangoutId', hangout.data._id);
      Session.set('hostId', hangout.data.host.id);
      Session.set('hostUsername', hangout.data.creator);

      Modal.show('reportHangoutModal');

    }
  }
});



=======
Template.hangoutCard.onRendered(function() {
  $(function() {
    $('[data-toggle="popover"]').popover({ trigger: "hover", html: "true" });
  });
});
Template.hangoutCard.helpers({
  truncate: function(topic) {
    return topic.truncate();
  },
  getDescriptionTruncated: function(description) {
    if (description.length && description.length > 400) {
      return description.substring(0, 400) + "...";
    } else {
      return description.substring(0, 400);
    }
  }
});

Template.hangoutCard.events({
  "click .join-hangout": function() {
    console.log("clicked on join hangout");
    const data = {
      hangoutId: this._id,
      hostId: this.host.id
    };
    Meteor.call("addUserToHangout", data, function(error, result) {
      if (result) {
        swal({
          title: TAPi18n.__("you_are_awesome"),
          text: TAPi18n.__("looking_forward_to_see_you"),
          confirmButtonText: TAPi18n.__("ok"),
          type: "info"
        });
      }
    });
  },
  "click #leave-hangout": function() {
    if (this.host.id == Meteor.userId()) {
      swal({
        title: TAPi18n.__("remove_owner_from_hangout"),
        confirmButtonText: TAPi18n.__("ok"),
        type: "warning"
      });
    } else {
      const data = {
        hangoutId: this._id,
        hostId: this.host.id
      };

      Meteor.call("removeUserFromHangout", data, function(error, result) {
        if (result) console.log("removed");
      });
    }
  }
});
>>>>>>> upstream/staging
