import { ClpFormatPipe } from './clp-format-pipe'


describe('ClpFormatPipe', () => {
    let pipe: ClpFormatPipe;

    beforeEach(() => {
        pipe = new ClpFormatPipe();
    });

    it('shoul create', () => {
        expect(pipe).toBeTruthy();
    })

    it('should format 1000 as "1.000"', () => {
        expect(pipe.transform(1000)).toBe('1.000');
    });

    it('should format 14990 as "14.990"', () => {
        expect(pipe.transform(14990)).toBe('14.990');
    });

    it('should format 0 as "0"', () => {
        expect(pipe.transform(0)).toBe('0');
    });

    it('should format large number 1000000 as "1.000.000"', () => {
        expect(pipe.transform(1000000)).toBe('1.000.000');
    });

    it('should format negative number -5000 as "-5.000"', () => {
        expect(pipe.transform(-5000)).toBe('-5.000');
    });
});