<?php

session_start();
$errors = isset($_SESSION['errors']) ? $_SESSION['errors'] : [];
$fields = isset($_SESSION['fields']) ? $_SESSION['fields'] : [];

?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <title>Behave Weight Loss - Sustainable Fitness For a Sustainble
    Lifestyle</title><!-- Bootstrap -->
    <link href="/css/bootstrap.css" rel="stylesheet">
    <link href='https://fonts.googleapis.com/css?family=Sigmar+One' rel=
    'stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Josefin+Sans' rel=
    'stylesheet' type='text/css'>
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
<![endif]-->
</head>
<body>
    <div class="navbar-wrapper behaveNav">
        <div class="container">
            <div class="navbar navbar-inverse navbar-static-top">
                <div class="behaveBookBtn">
                    <a href="book.html">Book An Appointment!</a>
                </div>
                <div class="navbar-header">
                     <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                     <a class="navbar-brand hidden-xs"
                    href="index.html"><img alt=
                    "Behave Weight Loss - Sustainable Fitness For a Sustainble Lifestyle"
                    class="desktopLogo" src="/img/behaveWeightLossLogo.png"></a>
                    <a class=
                    "navbar-brand hidden-sm hidden-md hidden-lg behaveName"
                    href="index.html">Behave Weight Loss</a>
                </div>
                <div class="navbar-collapse collapse">
                    <ul class="nav navbar-nav">
                        <li class="active">
                            <a href="index.html">Home</a>
                        </li>
                        <li>
                            <a href="services.html">Services</a>
                        </li>
                        <li>
                            <a href="results.html">Results</a>
                        </li>
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown"
                            href="#">More <b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a href="about.html">About Us</a>
                                </li>
                                <li>
                                    <a href="contact.html">Contact Us</a>
                                </li>
                                <li class="divider"></li>
                                <li>
                                    <a href="specials.html">Specials</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="nav navbar-nav navbar-right">
                        <li class="inactive">
                            <a href=
                            "https://www.facebook.com/RobertWarnerFitness/"><img alt="Behave Weight Loss - Facebook Page"
                            class="navSocial" src="/img/facebook.png"><div class="visible-xs socialText">Facebook</div></a>
                        </li>
                        <li class="inactive">
                            <a href=
                            "https://www.instagram.com/behaveweightloss/"><img alt="Behave Weight Loss - Instagram Page"
                            class="navSocial" src="/img/instagram.png"><div class="visible-xs socialText">Instagram</div></a>
                        </li>
                        <li class="inactive">
                            <a href="https://twitter.com/behavefit"><img alt=
                            "Behave Weight Loss - Twitter Page" class=
                            "navSocial" src="/img/twitter.png"><div class="visible-xs socialText">Twitter</div></a>
                        </li>
                    </ul>
                </div>
            </div>
        </div><!-- /container -->
    </div><!-- /navbar wrapper -->
    <!-- CAROUSEL -->
    <div class="container behaveContainer behaveTopContainer">
        <div class="row behaveRow behaveCar">
            <div class="carousel slide" id="myCarousel">
                <!-- Indicators -->
                <ol class="carousel-indicators">
                    <li class="active" data-slide-to="0" data-target=
                    "#myCarousel"></li>
                    <li data-slide-to="1" data-target="#myCarousel"></li>
                    <li data-slide-to="2" data-target="#myCarousel"></li>
                </ol>
                <div class="carousel-inner">
                    <h1 class="carouselH1">Sustainable Fitness for a Sustainable Lifestyle!</h1>
                    <div class="item active">
                        
                        <img class="img-responsive" src="/img/insideStudio.jpg"
                        style="width:100%">
                        <div class="container">
                            <div class="carousel-caption">
                                <!-- H1 -->
                                <!-- BUTTON -->
                            </div>
                        </div>
                    </div>
                    <div class="item">
                        
                        <img class="img-responsive" src="/img/outsideStudio.jpg"
                        style="width:100%">
                        <div class="container">
                            <div class="carousel-caption">
                                <!-- H1 -->
                                <!-- BUTTON-->
                            </div>
                        </div>
                    </div>
                    <div class="item">
                        
                        <img class="img-responsive" src="/img/carousel1.png"
                        style="width:100%">
                        <div class="container">
                            <div class="carousel-caption">
                                <!-- H1 -->
                                <!--
                                <p><a class="btn btn-lg btn-primary" href=
                                "specials.html">Learn More</a></p>
                                -->
                            </div>
                        </div>
                    </div>
                </div><!-- Controls -->
                 <a class="left carousel-control" data-slide="prev" href=
                "#myCarousel"></a><a class=
                "right carousel-control" data-slide="next" href=
                "#myCarousel"></a></a>
            </div>
        </div><!-- /.row -->
    </div><!-- /CAROUSEL -->
    
    <div class="container marketing">
        <!-- Features -->
        <div class="row behaveRow">
            <link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css">
            <div class="container bootstrap snippet">
                <section id="contact" class="gray-bg padding-top-bottom">
                    <div class="container bootstrap snippet">
                        <div class="row">
                            <form id="Highlighted-form" class="col-sm-6 col-sm-offset-3" action="contact.php" method="post" novalidate="">
                                
                                <?php if(!empty($errors)) ?>
                                    <div class="panel">
                                        <ul>
                                            <li>
                                                <?php echo implode('</li></li>', $errors); ?> 
                                            </li>
                                        </ul>
                                    </div>
                                <?php endif; ?>
                                <div class="form-group">
                                  <label class="control-label" for="contact-name">Name</label>
                                  <div class="controls">
                                    <input id="contact-name" name="name" placeholder="Your name" class="form-control requiredField Highlighted-label" data-new-placeholder="Your name" type="text" data-error-empty="Please enter your name">
                                    <i class="fa fa-user"></i>
                                  </div>
                                </div><!-- End name input -->
                                
                                <div class="form-group">
                                  <label class="control-label" for="contact-mail">Email</label>
                                  <div class=" controls">
                                    <input id="contact-mail" name="email" placeholder="Your email" class="form-control requiredField Highlighted-label" data-new-placeholder="Your email" type="email" data-error-empty="Please enter your email" data-error-invalid="Invalid email address">
                                    <i class="fa fa-envelope"></i>
                                  </div>
                                </div><!-- End email input -->
                                <div class="form-group">
                                  <label class="control-label" for="contact-message">Message</label>
                                    <div class="controls">
                                        <textarea id="contact-message" name="message" placeholder="Your message" class="form-control requiredField Highlighted-label" data-new-placeholder="Your message" rows="6" data-error-empty="Please enter your message"></textarea>
                                        <i class="fa fa-comment"></i>
                                    </div>
                                </div><!-- End textarea -->
                                <p><button name="submit" type="submit" class="btn btn-info btn-block" data-error-message="Error!" data-sending-message="Sending..." data-ok-message="Message Sent"><i class="fa fa-location-arrow"></i>Send Message</button></p>
                                <input type="hidden" name="submitted" id="submitted" value="true">	
                            </form><!-- End Highlighted-form -->
                        </div>	
                    </div>	
                </section>
            </div>                    
        </div><!-- /.row -->
        <!-- / FEATURES -->
        <!-- FOOTER -->
        <footer>
            <p class="pull-right"><a href="#">Back to top</a></p>
            <p>Behave Weight Loss | © 2016 All Rights Reserved | <a href=
            "contact.html">Contact Us</a></p>
        </footer><!-- /FOOTER -->
    </div><!-- /.container -->
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src=
    "https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js">
    </script> 
    <!-- Include all compiled plugins (below), or include individual files as needed -->
     
    <script src="js/bootstrap.min.js">
    </script>
</body>
</html>

<?php
unset($_SESSION['errors']);
?>