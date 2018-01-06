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

        window.location.href = window.location.origin +'/restaurant/filter?min='+ min+ '&max=' + max + '&ratingmin=' + ratingmin + '&ratingmax='+ ratingmax

    })
  })
