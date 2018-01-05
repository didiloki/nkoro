 /*
  * Name : Nkoro App
  *
  */
  $(document).ready(function(){

    $('.filter_search').on('click', function(){
        // min=800&max=2000&ratingmin=2&ratingmax=4
        let price = $('#price_range').val().split(";")
        let min = price[0]
        let max = price[1]

        let rating = $('#star_rating_range').val().split(";")
        let ratingmin = rating[0]
        let ratingmax = rating[1]

        console.log(window.location.origin)
  console.log(window.location.origin +'/restaurant/filter?min='+ min+ '&max=' + max + '&ratingmin=' + ratingmin + '&ratingmax='+ ratingmax);
// +min+'&max='+max+'&ratingmin='+ratingmin+'&ratingmax='ratingmax
        console.log($('#star_rating_range').val())
        console.log($('#price_range').val().split(";"))


        window.location.href = window.location.origin +'/restaurant/filter?min='+ min+ '&max=' + max + '&ratingmin=' + ratingmin + '&ratingmax='+ ratingmax


      // $.ajax({
      //       type: "GET",
      //       url: "/restaurant/filter",
      //       data: { "min": min, "max": max },
      //       error: function(){
      //             alert("Error")
      //       },
      //       success: function(data){
      //           console.log(data)
      //           let html = 'ok'
      //           template = Handlebars.compile(data)
      //           console.log(template);
      //           $('.restaurant-list-item-wrapper').empty()
      //
      //           $('.restaurant-list-item-wrapper').append(html)
      //             // $("#result").empty();
      //             // $("#result").append(data);
      //
      //       }
      //     });
    })
  })
