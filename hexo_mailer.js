var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('itvuB5hxdODKIQ8ezSTwtA');

var fs = require('fs');
var ejs = require('ejs');
 
var FeedSub = require('feedsub');
 
var csvFile = fs.readFileSync("friends_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');
 

var blogContent = new FeedSub('http://es1831.github.io/atom.xml', {
		emitOnStart: true
});



 
 
var latestPosts = [];
 
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      //console.log(message);
       console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
  }

function csvParse(csvFile){
	var arrayOfObjects = [];
	var arr = csvFile.split("\n");
	var newObj;
 
	keys = arr.shift().split(",");
 
	arr.forEach(function(contact){
		contact = contact.split(",");
		newObj = {};
		
		for(var i =0; i < contact.length; i++){
			newObj[keys[i]] = contact[i];
		}
 
		arrayOfObjects.push(newObj);
 
	})
 
	return arrayOfObjects;
}
 
blogContent.read(function(err,blogPosts){
 
  blogPosts.forEach(function(post){
  
  // CHECK IF POST IS 7 Days old or Less. If it is, put the post object in the array.
 		var pub = post.published.split('');
		var pub_month = +(pub[5].toString() + pub[6].toString());
		var pub_day = +(pub[8].toString() + pub[9].toString());

		var current = new Date();
		var current_month = current.getMonth() + 1; 
		var current_day = +(current.toString().split(" "))[2];

		if(pub_month == current_month) {
			if(Math.abs(current_day - pub_day) < 8) {
				latestPosts.push(post);
			}
		} else if(Math.abs(current_month - pub_month) == 1){
			if(pub_day - current_day > 22) {
				latestPosts.push(post);
			}
		}
	}) 
  
  
 
 
  csvData = csvParse(csvFile);
  csvData.forEach(function(row){
    firstName = row["firstName"];
    monthsSinceContact = row["monthsSinceContact"];
    emailAddress = row["email_address"];
    copyTemplate = emailTemplate;
    var customizedTemplate = ejs.render(copyTemplate, 
      {firstName: firstName,
       monthsSinceContact: monthsSinceContact,
       latestPosts: latestPosts
    });
    
    //console.log(customizedTemplate);

    sendEmail(firstName, emailAddress, "Emmie", "emmie.salama@gmail.com", "New Email", customizedTemplate);
  })
})