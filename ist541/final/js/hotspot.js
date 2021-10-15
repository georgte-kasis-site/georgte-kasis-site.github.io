// JavaScript Document
$( function() {
   $("map area").click( function(){

      if ($(this).attr("id") == "LEBANON") {
         $("#feedback").css("color","red");
         $("#feedback").html("Incorrect, LEBANON is the third largest");
      }

      if ($(this).attr("id") == "SYRIA") {
         $("#feedback").css("color","green");
         $("#feedback").html("Great job, SYRIA is the largest");
      }

      if ($(this).attr("id") == "JORDAN") {
         $("#feedback").css("color","red");
         $("#feedback").html("Try again, JORDAN is the second largest");
      }

  $("#feedback").css("backgroundColor","yellow");

   });
}); //end main jQuery function



