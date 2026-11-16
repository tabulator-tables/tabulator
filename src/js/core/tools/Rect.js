export default class Rect {
	constructor(top, bottom, left, right) {
		this.top = top;
		this.bottom = bottom;
		this.left = left;
		this.right = right;
	}

	static zero() {
		return new Rect(0, 0, 0, 0);
	}

	clone() {
		return new Rect(this.top, this.bottom, this.left, this.right);
	}

	/**
	 * Check if this rect and other are equal
	 * @param {Rect} other
	 */
	equals(other) {
		return (
			this.top === other.top &&
			this.bottom === other.bottom &&
			this.left === other.left &&
			this.right === other.right
		);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	hasPoint(x, y) {
		return (
			x >= this.left &&
			x <= this.right &&
			y >= this.top &&
			y <= this.bottom
		);
	}

	/**
	 * Executes a provided function once for each point in the rectangle
	 * @param {(x: number, y: number) => void} fn
	 */
	forEach(fn) {
		for (let y = this.top; y <= this.bottom; y++) {
			for (let x = this.left; x <= this.right; x++) {
				fn(x, y);
			}
		}
	}
}
