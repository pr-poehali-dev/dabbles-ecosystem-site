UPDATE cp_email_templates SET
  subject = 'Добро пожаловать в личный кабинет — {{company_name}}',
  body_html = '<p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
<p>Для вас создан личный кабинет на портале <strong>{{company_name}}</strong>.</p>
<p>Перейдите по ссылке и задайте пароль для входа через единый Даббл ID:</p>
<p><a href="{{portal_url}}">{{portal_url}}</a></p>
<p>Логин для входа — ваш email: {{email}}</p>
<p>С уважением,<br>{{company_name}}</p>'
WHERE code = 'welcome';