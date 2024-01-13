export abstract class Argument<T>{
     /**
     * {@inheritdoc}
     */
    abstract getValues(): T[];
  
  
      /**
       * @param [] values The service references to put in the set
       */
    abstract  setValues(values: T[]): void;

}
export default Argument;