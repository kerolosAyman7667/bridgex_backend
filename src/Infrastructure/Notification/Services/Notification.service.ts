import { Injectable, Provider, Scope } from "@nestjs/common";
import { INotification } from "src/Common/Generic/Contracts/INotificationService";
import { EmailService } from "./Email.service";
import { IEmailDto } from "../Dtos/IEmail.dto";
import { ConfigService } from "@nestjs/config";

@Injectable({scope:Scope.REQUEST})
export class NotificationService implements INotification
{
    constructor(private readonly emailService:EmailService,private readonly configService:ConfigService)
    {}

    async SendVerifyLink(toEmail: string, token: string): Promise<void> {
        
        await this.emailService.SendEmail({
            Subject:"Verification",
            HtmlTemplateFilePath:"verification",
            To:toEmail,
            Message:"Verify your identity",
            Context:{
                Link:`${this.GetFrontendLink()}/${this.configService.getOrThrow<string>("FRONTEND_VERIFY_RELATIVE_URL")}?Email=${toEmail}&Token=${token}`
            }
        });
    }

    async SendResetPass(toEmail:string,code:number): Promise<void> {

        await this.emailService.SendEmail({
            Subject:"Reset Password",
            HtmlTemplateFilePath:"forgetpass",
            To:toEmail,
            Message:"Reset password verification code",
            Context:{
                Code: code
            }
        });
        
    }

    async SendLeaderCommunityEmail(toEmail:string,userName:string,communityName:string): Promise<void> {
        await this.emailService.SendEmail({
            Subject:"Role changes",
            HtmlTemplateFilePath:"communityleader",
            To:toEmail,
            Message:"You have been community leader",
            Context:{
                username: userName,
                community:communityName
            }
        });
    }

    async SendLeaderTeamEmail(toEmail:string,userName:string,communityName:string,teamName:string): Promise<void> {
        await this.emailService.SendEmail({
            Subject:"Role changes",
            HtmlTemplateFilePath:"teamleader",
            To:toEmail,
            Message:"You have been team leader",
            Context:{
                username: userName,
                community:communityName,
                team:teamName
            }
        });
    }

    async SendHeadSubTeamEmail(toEmail:string,userName:string,subTeamName:string): Promise<void> {
        await this.emailService.SendEmail({
            Subject:"Role changes",
            HtmlTemplateFilePath:"subteamhead",
            To:toEmail,
            Message:"You have been sub team head",
            Context:{
                username: userName,
                subteam:subTeamName
            }
        });
    }

    async SendSubTeamMemberAddEmail(toEmail:string,userName:string,subTeamName:string): Promise<void> {
        await this.emailService.SendEmail({
            Subject:"Sub team members",
            HtmlTemplateFilePath:"subteamaccepted",
            To:toEmail,
            Message:"You have been added to sub team",
            Context:{
                username: userName,
                subteam:subTeamName
            }
        });
    }
    
    SentNotification() {
        throw new Error("Method not implemented.");
    }
    SendEmailAndNotification() {
        throw new Error("Method not implemented.");
    }
    
    private GetFrontendLink():string
    {
        return `${this.configService.getOrThrow<string>("FRONTEND_PROTOCOL")}://`+
                `${this.configService.getOrThrow<string>("FRONTEND_DOMAIN")}:` +
                `${this.configService.getOrThrow<string>("FRONTEND_PORT")}`
    }
}

export const NotificationServiceProvider:Provider = {
    provide:INotification,
    useClass:NotificationService
} 