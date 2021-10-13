// JavaScript Document
$( function() {
   $("map area").click( function(){

      if ($(this).attr("id") == "LEBANON") {
         $("#feedback").css("color","red");
         $("#feedback").html("No, LEBANON is the third one");
      }

      if ($(this).attr("id") == "SYRIA") {
         $("#feedback").css("color","green");
         $("#feedback").html("Yes, SYRIA has the largest");
      }

      if ($(this).attr("id") == "JORDAN") {
         $("#feedback").css("color","red");
         $("#feedback").html("No,JORDAN is the second one");
      }

  $("#feedback").css("backgroundColor","yellow");

   });
}); //end main jQuery function



