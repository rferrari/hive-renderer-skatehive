// import ow from 'ow';

export class Localization {
    public static validate(options: LocalizationOptions) {
        if (!options || typeof options !== 'object') {
          throw new Error('LocalizationOptions should be an object');
        }
      
        if (!options.phishingWarning || typeof options.phishingWarning !== 'string' || options.phishingWarning.trim().length === 0) {
          throw new Error('phishingWarning should be a non-empty string');
        }
      
        if (!options.externalLink || typeof options.externalLink !== 'string' || options.externalLink.trim().length === 0) {
          throw new Error('externalLink should be a non-empty string');
        }
      
        if (!options.noImage || typeof options.noImage !== 'string' || options.noImage.trim().length === 0) {
          throw new Error('noImage should be a non-empty string');
        }
      
        if (!options.accountNameWrongLength || typeof options.accountNameWrongLength !== 'string' || options.accountNameWrongLength.trim().length === 0) {
          throw new Error('accountNameWrongLength should be a non-empty string');
        }
      
        if (!options.accountNameBadActor || typeof options.accountNameBadActor !== 'string' || options.accountNameBadActor.trim().length === 0) {
          throw new Error('accountNameBadActor should be a non-empty string');
        }
      
        if (!options.accountNameWrongSegment || typeof options.accountNameWrongSegment !== 'string' || options.accountNameWrongSegment.trim().length === 0) {
          throw new Error('accountNameWrongSegment should be a non-empty string');
        }
      };

    public static DEFAULT: LocalizationOptions = {
        phishingWarning: 'Link expanded to plain text; beware of a potential phishing attempt',
        externalLink: 'This link will take you away from example.com',
        noImage: 'Images not allowed',
        accountNameWrongLength: 'Account name should be between 3 and 16 characters long',
        accountNameBadActor: 'This account is on a bad actor list',
        accountNameWrongSegment: 'This account name contains a bad segment'
    };
}

export interface LocalizationOptions {
    phishingWarning: string; // "Link expanded to plain text; beware of a potential phishing attempt"
    externalLink: string; // "This link will take you away from example.com"
    noImage: string; // "Images not allowed"
    accountNameWrongLength: string; // "Account name should be between 3 and 16 characters long."
    accountNameBadActor: string; // "This account is on a bad actor list"
    accountNameWrongSegment: string; // "This account name contains a bad segment"
}
