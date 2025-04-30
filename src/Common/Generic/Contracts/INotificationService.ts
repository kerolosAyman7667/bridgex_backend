export interface INotification
{
    SendResetPass(toEmail:string,code:number):Promise<void>

    SendVerifyLink(toEmail:string,token:string):Promise<void>

    SendLeaderCommunityEmail(toEmail:string,userName:string,communityName:string): Promise<void>
    
    SendLeaderTeamEmail(toEmail:string,userName:string,communityName:string,teamName:string): Promise<void>
    
    SendHeadSubTeamEmail(toEmail:string,userName:string,subTeamName:string): Promise<void>
    
    SendSubTeamMemberAddEmail(toEmail:string,userName:string,subTeamName:string): Promise<void>

    SentNotification()

    SendEmailAndNotification()
}

export const INotification = Symbol('INotification')