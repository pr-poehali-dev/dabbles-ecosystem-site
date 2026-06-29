UPDATE cp_email_templates
SET body_html = REPLACE(
  body_html,
  '<a href="{{portal_url}}">{{portal_url}}</a>',
  '<a href="{{portal_url}}">даббл-корп.рф</a>'
)
WHERE body_html LIKE '%<a href="{{portal_url}}">{{portal_url}}</a>%';