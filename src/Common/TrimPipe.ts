import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { IsArray } from 'class-validator'
    
    @Injectable()
    export class TrimPipe implements PipeTransform {
      private isObj(obj: any): boolean {
        return typeof obj === 'object' && obj !== null
      }
    
      private trim(values) {
        if(IsArray(values) && values.length > 10)return values
        Object.keys(values).forEach(key => {
          if (key !== 'password') {
            if (this.isObj(values[key])) {
              values[key] = this.trim(values[key])
            } else {
              if (typeof values[key] === 'string') {
                values[key] = values[key].trim()
              }
            }
          }
        })
        return values
      }
    
      transform(values: any, metadata: ArgumentMetadata) {
        if (this.isObj(values)) {
          return this.trim(values)
        }    

        return values;
      }
    }