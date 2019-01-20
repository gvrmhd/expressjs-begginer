$(document).ready(function() {
  $("li.active").removeClass("active");
  $(".delete-data").click(function() {
    let pil = confirm('Are you sure want to delete ?');
    if(pil) {
      const id = $(this).attr("data-id");
      $.ajax({
        type: "DELETE",
        url: `/articles/${id}`,
        success: function(res) {
          window.location.href = "/";
        },
        error: function(err) {
          throw err;
        }
      });
    }
  });
});