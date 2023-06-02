from odoo import fields, models
import re

def remove_html(string):
    regex = re.compile(r'<[^>]+>')
    return regex.sub('', string)

class MailMessage(models.Model):
    _inherit = 'mail.message'
    _description = 'MailMessage'

    def action_cron(self):
        for record in self:
            if self.subtype_id.id == self.env.ref("mail.mt_comment").id and self.model == 'mail.channel':
                #if len(record.body) > 30:
                    #record._create_task()
                record._create_lead()

    def _create_task(self):
        self.env['project.task'].create({
            'name': 'Test Task',
            'description': self.body,
            'user_ids': [(4, self.env.ref("base.user_admin").id)],
        })


    def _create_lead(self):
        name = remove_html(self.body)
        lead = self.env['crm.lead'].create({
            'name': name,
            'type': 'opportunity',
            'user_id': self.env.ref("base.user_admin").id,
            'team_id': self.env.ref("sales_team.team_sales_department").id,
            'partner_id': False,
            'contact_name': 'Amy Wong',
            'email_from': 'amy.wong@test.example.com',
            'country_id': self.env.ref('base.us').id,
        })
        print(lead.id)
        if len(self.body) < 30:
            self.env['mail.message'].create({
                'message_type': 'comment',
                'body': self.body,
                'subtype_id': self.env.ref("mail.mt_comment").id,
                'model': 'crm.lead',
                'res_id': lead.id,
            })
        else:
            mail_activity = self.env['mail.activity'].create({
                'note': self.body,
                'user_id': self.env.ref("base.user_admin").id,
                'activity_type_id': self.env.ref("mail.mail_activity_data_todo").id,
                'res_model_id': self.env.ref('crm.model_crm_lead').id,
                'res_id': lead.id,
            })
            mail_activity.action_done()




