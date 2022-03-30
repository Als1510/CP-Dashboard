const express = require('express')
const router = express.Router()
const path = require('path')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')
const OtpToken = require('../../models/OtpToken')

// @route   GET api/validation/varify/:uniqueString
// @desc    Verify User
// @access  Public
router.get('/verify/:uniqueString', async (req, res) => {
  const uniqueString = req.params.uniqueString
  const user = await User.findOne({ uniqueString: uniqueString })

  if(user) {
    await User.updateOne({_id: user._id}, {$set: {active: true}})
    res.sendFile(path.join(__dirname + '../../../config/activationResponseSuccess.html'))
  } else {
    res.sendFile(path.join(__dirname + '../../../config/activationResponseFailure.html'))
  }
})

// @route   POST api/validation
// @desc    Verify User
// @access  Public
router.post('/', [
  check('email', 'Please enter a valid email').isEmail()
], async(req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email } = req.body

  try{
    let user = await User.findOne({ email })

    if(!user) {
      return res.status(400).json({ errors: [{ msg: 'Email does not exists. Please create a new account' }] })
    }

    let previousRecord = await OtpToken.findOne({ email })

    if(previousRecord) {
      let currTime = new Date().getTime()
      let diff = previousRecord.expiresIn - currTime
      if(diff > 0) {
        return res.json({ msg: 'Otp has been sent to your registered email', name: user.name })
      } else {
        await OtpToken.deleteOne({ email })
      }
    }

    let otpCode = Math.floor((Math.random() * 1000000) + 1)

    let otpData = new OtpToken({
      email,
      otpCode,
      expiresIn: new Date().getTime() + 120*1000
    })

    await otpData.save()

    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.emailId,
        pass: process.env.emailPassword
      }
    })

    let info = await transporter.sendMail({
      from: `"CP-Dashboard" ${process.env.emailId}`,
      to:`${email}`,
      subject:"OTP(One Time Password)",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> <head> <meta charset="UTF-8"> <meta content="width=device-width, initial-scale=1" name="viewport"> <meta name="x-apple-disable-message-reformatting"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta content="telephone=no" name="format-detection"> <title>OTP</title><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if !mso]><!-- --> <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet"><!--<![endif]--> <style type="text/css"> @media only screen and (max-width:600px) { p, ul li, ol li, a { line-height: 150%!important; } h1, h2, h3, h1 a, h2 a, h3 a { line-height: 120%!important; } h1 { font-size: 30px!important; text-align: center; } h2 { font-size: 26px!important; text-align: center; } h3 { font-size: 20px!important; text-align: center; } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size: 30px!important; } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size: 26px!important; } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size: 20px!important; } .es-menu td a { font-size: 16px!important; } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size: 16px!important; } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size: 16px!important; } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size: 16px!important; } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size: 12px!important; } *[class="gmail-fix"] { display: none!important; } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align: center!important; } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align: right!important; } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align: left!important; } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display: inline!important; } .es-button-border { display: block!important; } a.es-button, button.es-button { font-size: 20px!important; display: block!important; border-width: 15px 25px 15px 25px!important; } .es-btn-fw { border-width: 10px 0px!important; text-align: center!important; } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width: 100%!important; } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width: 100%!important; max-width: 600px!important; } .es-adapt-td { display: block!important; width: 100%!important; } .adapt-img { width: 100%!important; height: auto!important; } .es-m-p0 { padding: 0px!important; } .es-m-p0r { padding-right: 0px!important; } .es-m-p0l { padding-left: 0px!important; } .es-m-p0t { padding-top: 0px!important; } .es-m-p0b { padding-bottom: 0!important; } .es-m-p20b { padding-bottom: 20px!important; } .es-mobile-hidden, .es-hidden { display: none!important; } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width: auto!important; overflow: visible!important; float: none!important; max-height: inherit!important; line-height: inherit!important; } tr.es-desk-hidden { display: table-row!important; } table.es-desk-hidden { display: table!important; } td.es-desk-menu-hidden { display: table-cell!important; } .es-menu td { width: 1%!important; } table.es-table-not-adapt, .esd-block-html table { width: auto!important; } table.es-social { display: inline-block!important; } table.es-social td { display: inline-block!important; } } </style> </head> <body style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> <div class="es-wrapper-color" style="background-color:#F4F4F4"> <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top"> <tr class="gmail-fix" height="0" style="border-collapse:collapse"> <td style="padding:0;Margin:0"> <table cellspacing="0" cellpadding="0" border="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:600px"> <tr style="border-collapse:collapse"> <td cellpadding="0" cellspacing="0" border="0" style="padding:0;Margin:0;line-height:1px;min-width:600px" height="0"><img src="https://ksibre.stripocdn.email/content/guids/CABINET_837dc1d79e3a5eca5eb1609bfe9fd374/images/41521605538834349.png" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;max-height:0px;min-height:0px;min-width:600px;width:600px" alt="" width="600" height="1"></td> </tr> </table></td> </tr> <tr style="border-collapse:collapse"> <td valign="top" style="padding:0;Margin:0"> <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> <tr style="border-collapse:collapse"> <td align="center" bgcolor="#333333" style="padding:0;Margin:0;background-color:#333333"> <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center"> <tr style="border-collapse:collapse"> <td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-left:30px;padding-right:30px;background-color:#ffffff"> <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td align="center" valign="top" style="padding:0;Margin:0;width:540px"> <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td align="center" style="padding:5px;Margin:0;font-size:0px"><img class="adapt-img" src="https://ksibre.stripocdn.email/content/guids/46a5020e-16b4-4a40-9e78-2936afdcffaf/images/favicon.png" alt="" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" height="87"></td> </tr> </table></td> </tr> </table></td> </tr> </table></td> </tr> </table> <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> <tr style="border-collapse:collapse"> <td style="padding:0;Margin:0;background-color:#333333" bgcolor="#333333" align="center"> <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center"> <tr style="border-collapse:collapse"> <td align="left" style="padding:0;Margin:0"> <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#ffffff;border-radius:4px" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" role="presentation"> <tr style="border-collapse:collapse"> <td align="center" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:30px;padding-right:30px"><h1 style="Margin:0;line-height:41px;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-size:34px;font-style:normal;font-weight:normal;color:#111111">OTP (One Time Password)</h1></td> </tr> <tr style="border-collapse:collapse"> <td bgcolor="#ffffff" align="center" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px;font-size:0"> <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td style="padding:0;Margin:0;border-bottom:1px solid #ffffff;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td> </tr> </table></td> </tr> </table></td> </tr> </table></td> </tr> </table></td> </tr> </table> <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> <tr style="border-collapse:collapse"> <td align="center" style="padding:0;Margin:0"> <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center"> <tr style="border-collapse:collapse"> <td align="left" style="padding:0;Margin:0"> <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:4px;background-color:#ffffff" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" role="presentation"> <tr style="border-collapse:collapse"> <td class="es-m-txt-l" bgcolor="#ffffff" align="center" style="Margin:0;padding-left:30px;padding-right:30px;padding-top:40px;padding-bottom:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">Your OTP(One Time Password) is<strong>&nbsp;</strong><u><strong>${otpCode}</strong></u>. Valid for 2 minutes.</p></td> </tr> <tr style="border-collapse:collapse"> <td class="es-m-txt-l" align="left" style="Margin:0;padding-top:20px;padding-left:30px;padding-right:30px;padding-bottom:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">Cheers,</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">The CP Dashboard team</p></td> </tr> </table></td> </tr> </table></td> </tr> </table></td> </tr> </table> <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> <tr style="border-collapse:collapse"> <td align="center" style="padding:0;Margin:0"> <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center"> <tr style="border-collapse:collapse"> <td align="left" style="padding:0;Margin:0"> <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#ffecd1;border-radius:4px" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffecd1" role="presentation"> <tr style="border-collapse:collapse"> <td align="center" bgcolor="#333333" style="padding:0;Margin:0;padding-top:30px;padding-left:30px;padding-right:30px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#ffffff">Need more help?</h3></td> </tr> <tr style="border-collapse:collapse"> <td esdev-links-color="#ffa73b" align="center" bgcolor="#333333" style="padding:0;Margin:0;padding-bottom:30px;padding-left:30px;padding-right:30px"><a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#ffffff;font-size:18px">We’re here, ready to talk</a></td> </tr> </table></td> </tr> </table></td> </tr> <tr style="border-collapse:collapse"> <td align="left" bgcolor="#333333" style="padding:0;Margin:0;padding-top:20px;padding-left:30px;padding-right:30px;background-color:#333333"> <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td align="center" valign="top" style="padding:0;Margin:0;width:540px"> <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> <tr style="border-collapse:collapse"> <td align="center" style="padding:10px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#ffffff;font-size:18px">Copyrights © CP Dashboard&nbsp;All Rights Reserved</p></td> </tr> </table></td> </tr> </table></td> </tr> </table></td> </tr> </table></td> </tr> </table> </div> </body> </html>`
    })
    
    res.json({ msg: "OTP has been sent to your registered mail address", name: user.name});

  } catch(error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})


// @route   POST api/validation/resetpassword
// @desc    Change password
// @access  Public
router.post('/resetpassword', [
  check('otpCode', 'Please enter otp').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otpCode, password } = req.body

  try{
    let otpData = await OtpToken.findOne({ email, otpCode })
    
    if(!otpData) {
      return res.status(400).json({ errors: [{ msg: 'Otp is invalid' }] })
    }

    let currTime = new Date().getTime()
    let diff = otpData.expiresIn - currTime
    if(diff < 0) {
      return res.status(400).json({ errors: [{ msg : 'Otp is invalid' }] })
    }

    let user = await User.findOne({ email })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()
    await OtpToken.deleteOne({ email })

    res.json({ msg: 'Password changed successfully' })
  } catch(error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router