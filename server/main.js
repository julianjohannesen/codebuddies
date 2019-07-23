<<<<<<< HEAD
import md5 from 'md5';


Meteor.startup(function() {
 // fire off cron jobs
  SyncedCron.start();

  Accounts.loginServiceConfiguration.remove({
    service : 'slack'
  });

  Accounts.loginServiceConfiguration.insert({
    service     : 'slack',
    "clientId" : Meteor.settings.slack_clientid,
    "secret" : Meteor.settings.slack_clientsecret,
    "loginStyle" : "popup"
  });

  smtp = {
    username: Meteor.settings.sparkpost_username,
    password: Meteor.settings.sparkpost_password,
    server: Meteor.settings.sparkpost_host,
    port: Meteor.settings.sparkpost_port
  }

  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

  if(Meteor.users.find().count()===0){

      var password = Random.secret([9]);
      var id = Accounts.createUser({
        username : Meteor.settings.root_username,
        email : Meteor.settings.root_email,
        password : password
      })
      if(id){
        Roles.addUsersToRoles(id, 'admin', 'CB');
        Email.send({
          to: Meteor.settings.root_email,
          from: Meteor.settings.email_from,
          subject: "With great power comes great responsibility",
          text: password
        });
      }
  }

});

var loggingInUserInfo = function(user) {
  var response = HTTP.get("https://slack.com/api/users.info",
    {params:
      {token: user.services.slack.accessToken,
       user: user.services.slack.id,
       scope: "users:read"
      }
    });
  return response.data.ok && response.data;
};

let filterForSlackLogins = (user) => {
    const username = user.name;
    const profile = {
      time_zone: user.tz,
      time_zone_label: user.tz_label,
      time_zone_offset: user.tz_offset,
      firstname: user.profile.first_name,
      lastname: user.profile.last_name,
      avatar: {
        default: user.profile.image_72,
        image_192: user.profile.image_192,
        image_512: user.profile.image_512
      }
    }
    const email = user.profile.email;

    return filterdFields = {
      username: username,
      profile: profile,
      email : email
    }
}

let generateGravatarURL = (email) => {
  const gravatarHash = md5(email.toLowerCase());
  return{
    default : Meteor.settings.root_gravatar + gravatarHash + '?size=72',
    image_192 : Meteor.settings.root_gravatar + gravatarHash + '?size=192',
    image_512 : Meteor.settings.root_gravatar + gravatarHash + '?size=512'
  }
}


Accounts.onCreateUser(function(options, user) {

  if (user.services.slack){
    Roles.setRolesOnUserObj(user, ['user'], 'CB');
    const user_info = loggingInUserInfo(user);
    const pickField = filterForSlackLogins(user_info.user)

    if(Meteor.settings.isModeProduction){
      const email = pickField.email;
      const merge_vars = {
          "FNAME": pickField.profile.firstname,
          "LNAME": pickField.profile.lastname,
          "TZ": pickField.profile.time_zone,
          "TZ_LABEL": pickField.profile.time_zone_label,
          "TZ_OFFSET": pickField.profile.time_zone_offset,
          "USERNAME": pickField.username
      }

      addUserToMailingList(email,merge_vars);
    }

    user.username = pickField.username;
    user.profile = pickField.profile;
    user.email = pickField.email;
    return user;
  }

  if(user.services.password){
    const avatar = generateGravatarURL(options.email);
    const profile = {
      avatar:avatar
    }

    user.username = user.username;
    user.profile = profile;
    user.email = options.email;
    return user;
  }

});

// global users observer for app_stats
Meteor.users.find({ "status.online": true }).observe({
  removed: function(user) {
    //remove participants from active list
    AppStats.update({"participants.id":user._id},
      {
        $pull: {
          participants: {
            id : user._id
          }
        },

      },
      {multi: true});

  }
});
=======
import md5 from "md5";
import "/imports/startup/server";
import { sendWelcomeMessage } from "/imports/libs/server/user/welcome_email";
import SlackAPI from "./slack/slack-api";

Meteor.startup(function() {
  // migration
  Migrations.migrateTo("latest");

  // fire off cron jobs
  SyncedCron.start();

  Accounts.loginServiceConfiguration.remove({
    service: "slack"
  });

  Accounts.loginServiceConfiguration.remove({
    service: "github"
  });

  Accounts.loginServiceConfiguration.insert({
    service: "slack",
    clientId: Meteor.settings.slack_clientid,
    secret: Meteor.settings.slack_clientsecret,
    loginStyle: "popup"
  });

  Accounts.loginServiceConfiguration.insert({
    service: "github",
    clientId: Meteor.settings.github_clientid,
    secret: Meteor.settings.github_clientsecret,
    loginStyle: "popup"
  });

  smtp = {
    username: Meteor.settings.private.smtp.username,
    password: Meteor.settings.private.smtp.password,
    server: Meteor.settings.private.smtp.server,
    port: Meteor.settings.private.smtp.port
  };

  process.env.MAIL_URL =
    "smtp://" +
    encodeURIComponent(smtp.username) +
    ":" +
    encodeURIComponent(smtp.password) +
    "@" +
    encodeURIComponent(smtp.server) +
    ":" +
    smtp.port;

  if (Meteor.users.find().count() === 0) {
    var password = Random.secret([9]);
    var id = Accounts.createUser({
      username: Meteor.settings.root_username,
      email: Meteor.settings.root_email,
      password: password
    });
    if (id) {
      Roles.addUsersToRoles(id, "admin", "CB");
      Email.send({
        to: Meteor.settings.root_email,
        from: Meteor.settings.email_from,
        subject: "With great power comes great responsibility",
        text: password
      });
    }
  }
});

let generateGravatarURL = email => {
  const gravatarHash = md5(email.toLowerCase());
  return {
    default: Meteor.settings.root_gravatar + gravatarHash + "?size=72",
    image_192: Meteor.settings.root_gravatar + gravatarHash + "?size=192",
    image_512: Meteor.settings.root_gravatar + gravatarHash + "?size=512"
  };
};

let getRandomUsername = function(username) {
  const adjectiveList = [
    "adorable",
    "elegant",
    "mighty",
    "brave",
    "fancy",
    "fearless",
    "magnificent",
    "bewildered",
    "fierce",
    "lazy",
    "mysterious",
    "worried",
    "curious",
    "weird",
    "cryptic"
  ];
  return `${adjectiveList[Math.floor(Math.random() * adjectiveList.length)]}${username}`;
};

let swapUsernameIfExists = function(username) {
  const usernameExists = Meteor.users.findOne({ username: username });
  if (usernameExists) {
    return swapUsernameIfExists(getRandomUsername(username));
  } else {
    return username;
  }
};

let swapUserIfExists = function(email, service, user) {
  const existingUser = Meteor.users.findOne({ email: email });

  if (existingUser) {
    if (!existingUser.services) {
      existingUser.services = { resume: { loginTokens: [] } };
    }

    existingUser.services[service] = user.services[service];
    user = existingUser;
    Meteor.users.remove({ _id: existingUser._id });
  } else {
    user.username = swapUsernameIfExists(user.username);
    SlackAPI.inviteUser(user.email);
  }

  return user;
};

Accounts.onCreateUser(function(options, user) {
  const service = _.keys(user.services)[0];

  if (service === "slack") {
    const username = options.slack.tokens.user.name;
    const email = options.slack.tokens.user.email;
    const avatar = generateGravatarURL(email);

    const profile = {
      avatar: avatar,
      complete: false
    };
    Roles.setRolesOnUserObj(user, ["user"], "CB");
    user.username = username;
    user.email = email;
    user.profile = profile;

    user = swapUserIfExists(email, service, user);
  }

  if (service === "github") {
    const email = user.services.github.email;

    const avatar = generateGravatarURL(user.services.github.email);
    const profile = {
      avatar: avatar,
      complete: false
    };

    Roles.setRolesOnUserObj(user, ["user"], "CB");
    user.username = user.services.github.username;
    user.email = user.services.github.email;
    user.profile = profile;
    user.emails_preference = [
      "join_hangout",
      "rsvp_to_hangout",
      "delete_hangout",
      "new_member",
      "new_hangout",
      "new_discussion",
      "new_direct_message",
      "bi_weekly_newsletter",
      "monthly_update"
    ];

    user = swapUserIfExists(email, service, user);
  }

  if (service === "password") {
    const avatar = generateGravatarURL(options.email);
    const profile = {
      avatar: avatar,
      complete: true
    };

    user.username = user.username;
    user.profile = profile;
    user.email = options.email;
    user.emails_preference = [
      "join_hangout",
      "rsvp_to_hangout",
      "delete_hangout",
      "new_member",
      "new_hangout",
      "new_discussion",
      "new_direct_message",
      "bi_weekly_newsletter",
      "monthly_update"
    ];

    SlackAPI.inviteUser(user.email);
    user = user;
  }

  sendWelcomeMessage(user);
  return user;
});

// global users observer for app_stats
Meteor.users.find({ "status.online": true }).observe({
  removed: function(user) {
    //remove participants from active list
    AppStats.update(
      { "participants.id": user._id },
      {
        $pull: {
          participants: {
            id: user._id
          }
        }
      },
      { multi: true }
    );
  }
});
>>>>>>> upstream/staging
